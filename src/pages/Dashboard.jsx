import React, { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  BarChart2,
  Menu,
  MessageSquare,
} from "lucide-react";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTasks } from "../context/TaskContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const COLORS = ["#3B82F6", "#22C55E", "#FACC15", "#EF4444"];

//* ---------- DASHBOARD COMPONENT ---------- */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { addActivity } = useTasks();

  const addActivityLog = (message) => {
    if (!user) return;
    const existingLogs = JSON.parse(localStorage.getItem("activityLog")) || [];
    const newLog = {
      id: Date.now(),
      user: user.username,
      role: user.role,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...existingLogs].slice(0, 200);
    localStorage.setItem("activityLog", JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event("activityLogUpdated"));
    addActivity(message);
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const menuItems = isAdmin
    ? [
        { key: "users", label: "Users", icon: <Users size={18} /> },
        { key: "tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
        { key: "activity", label: "Activity Log", icon: <MessageSquare size={18} /> },
        {/* key: "settings", label: "Settings", icon: <Settings size={18} /> */},
      ]
    : [
        { key: "tasks", label: "My Tasks", icon: <ClipboardList size={18} /> },
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
        {/* key: "settings", label: "Settings", icon: <Settings size={18} /> */},
      ];

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-10"
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <div
        className={`fixed top-0 left-0 h-screen z-20 transition-transform transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${
          darkMode
            ? "bg-gray-900 border-r border-gray-800"
            : "bg-gradient-to-b from-sky-50 to-indigo-50 border-r border-slate-200"
        } w-[80vw] sm:w-64 shadow-lg`}
      >
        <div
          className={`p-5 border-b flex items-center justify-between ${
            darkMode ? "border-gray-800" : "border-slate-200"
          }`}
        >
          <h2 className="text-xl font-semibold tracking-tight">TeamTrack</h2>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)]">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg font-medium transition-all
              ${
                activeTab === item.key
                  ? darkMode
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-sky-200 text-sky-900 shadow-sm"
                  : darkMode
                  ? "hover:bg-gray-800 hover:text-white"
                  : "hover:bg-sky-100 text-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {/* Topbar */}
<header
  className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 
  ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white/80 backdrop-blur border-slate-200"}`}
>  <div className="flex items-center gap-3">
      <button
      onClick={() => setSidebarOpen((prev) => !prev)}
      className="text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Menu size={22} />
    </button>
    <h1 className="text-xl font-semibold capitalize">{activeTab === 'activity' ? 'Activity Log' : activeTab}</h1>
  </div>
  <div></div>
</header>
        {/* Tabs */}
        <main className={`p-4 sm:p-6 pb-8`}>
          {activeTab === "users" && <UsersTab darkMode={darkMode} addActivityLog={addActivityLog} />}
          {activeTab === "tasks" && <TasksTab darkMode={darkMode} addActivityLog={addActivityLog} />}
          {activeTab === "analytics" && <AnalyticsTab darkMode={darkMode} />}
          {activeTab === "activity" && <ActivityLogTab darkMode={darkMode} />}
          {/* {activeTab === "settings" && <SettingsTab darkMode={darkMode} addActivityLog={addActivityLog} />} */}
        </main>
      </div>
    </div>
  );
}


/* ---------- USERS TAB---------- */

function UsersTab({ darkMode }) {
  const { register } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", role: "user", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All"); // New filter state
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Modal state

  //Fetch users from Firestore
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by role
  const filteredUsers = users.filter(user => {
    if (roleFilter === "All") return true;
    if (roleFilter === "Admin") return user.role?.toLowerCase() === "admin";
    if (roleFilter === "User") return user.role?.toLowerCase() === "user";
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email) return alert("Fill all fields");

    if (editingUser) {
      //Update user role / name
      await updateDoc(doc(db, "users", editingUser.id), {
        username: form.username,
        email: form.email,
        role: form.role
      });

      setEditingUser(null);
      alert("User updated");
    } else {
      //Admin creates a new Firebase user
      try {
        await register(form.email, form.password, form.username, form.role);
        alert("New user created ✅");
      } catch (err) {
        alert(err.message);
      }
    }

    setForm({ username: "", email: "", role: "user", password: "" });
    setShowAddUserModal(false); // Close modal after submit
    fetchUsers();
  };

  // Edit button
  const handleEdit = (u) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      email: u.email,
      role: u.role,
      password: ""
    });
  };

  // Delete user from Firestore
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  return (
    <>
      {/* Filter and Add User Button */}
      <div className={`mb-6 p-4 rounded-2xl shadow-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Filter Section - Left Side */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-bold uppercase tracking-wider opacity-70">
              Filter by Role:
            </label>
            <div className="flex gap-2 flex-wrap">
              {["All", "User", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    roleFilter === role
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {role === "All" && "👥 "}
                  {role === "User" && "👤 "}
                  {role === "Admin" && "👑 "}
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Add User Button - Right Side */}
          <button
            onClick={() => {
              setEditingUser(null);
              setForm({ username: "", email: "", role: "user", password: "" });
              setShowAddUserModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl">+</span> Add User
          </button>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className="text-xl font-semibold mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                required
                className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                required
                className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              
              {!editingUser && (
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              )}

              <select
                className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold"
                >
                  {editingUser ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                    setForm({ username: "", email: "", role: "user", password: "" });
                  }}
                  className={`px-4 py-2 rounded-md border ${
                    darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users list */}
      <div className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <table className="w-full text-sm">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <tr>
              <th className="p-4 text-left font-bold">Username</th>
              <th className="p-4 text-left font-bold">Email</th>
              <th className="p-4 text-left font-bold">Role</th>
              <th className="p-4 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className={`border-b transition-colors ${
                darkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-200 hover:bg-gray-50"
              }`}>
                <td className="p-4">{u.username}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    u.role === "admin" 
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button 
                    onClick={() => {
                      handleEdit(u);
                      setShowAddUserModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-600 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(u.id)} 
                    className="text-red-500 hover:text-red-600 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan="4" className="text-center p-4 text-gray-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}


/* ---------- TASKS TAB ---------- */
function TasksTab({ darkMode, addActivityLog }) {
  const { user } = useAuth();
  const { tasks = [], addTask, updateTask, deleteTask, addComment } = useTasks();

  const [usersList, setUsersList] = useState([]); // ✅ Firebase user list
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: [], // Changed to array for multiple users
    status: "To Do",
    priority: "Low",
    dueDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentModalTask, setCommentModalTask] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All Priority");
  const [filterUser, setFilterUser] = useState("All Users");
  const [searchQuery, setSearchQuery] = useState("");

  const safeTasks = tasks || [];
  const visibleTasks =
    user?.role?.toLowerCase() === "admin"
      ? safeTasks
      : safeTasks.filter((t) => {
          // Handle both array (new format) and string (legacy format) for assignedTo
          if (Array.isArray(t.assignedTo)) {
            return t.assignedTo.some(
              (assignee) => assignee?.toLowerCase() === user?.username?.toLowerCase()
            );
          }
          return t.assignedTo?.toLowerCase() === user?.username?.toLowerCase();
        });
        
  // Apply filters
  const filteredTasks = visibleTasks.filter(task => {
    const statusMatch = filterStatus === "All" || task.status === filterStatus;
    const priorityMatch = filterPriority === "All Priority" || task.priority === filterPriority;
    
    // Handle both array and string for assignedTo
    let userMatch = filterUser === "All Users";
    if (!userMatch) {
      if (Array.isArray(task.assignedTo)) {
        userMatch = task.assignedTo.includes(filterUser);
      } else {
        userMatch = task.assignedTo === filterUser;
      }
    }
    
    // Search by task title or description
    const searchMatch = searchQuery.trim() === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && priorityMatch && userMatch && searchMatch;
  });

  /* ✅ Fetch users from Firebase */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(usersRef);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsersList(list);
      } catch (err) {
        console.error("Error loading users: ", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo || form.assignedTo.length === 0) {
      alert("Please fill in title and assign at least one user");
      return;
    }

    const normalizedStatus =
      form.status.toLowerCase() === "completed" ? "Done" : form.status;

    if (editingId && editingId !== "new") {
      // Update existing task
      updateTask(editingId, { ...form, status: normalizedStatus });
    } else {
      // Create new task
      addTask({
        ...form,
        id: Date.now(),
        comments: [],
        status: normalizedStatus,
      });
    }

    // Reset form and close modal
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      assignedTo: [],
      status: "To Do",
      priority: "Low",
      dueDate: "",
    });
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  return (
    <>
      {/* Filter Section */}
      <div className={`mb-8 p-6 rounded-2xl shadow-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="flex flex-col gap-5">
          {/* Search Bar with New Task Button */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
                Search Tasks
              </label>
              <input
                type="text"
                placeholder="🔍 Search by task name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600" 
                    : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                }`}
              />
            </div>
            {user?.role?.toLowerCase() === "admin" && (
              <button
                onClick={() => {
                  setEditingId("new");
                  setForm({
                    title: "",
                    description: "",
                    assignedTo: [],
                    status: "To Do",
                    priority: "Low",
                    dueDate: "",
                  });
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span className="text-xl">+</span> New Task
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Filter by Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {["All", "To Do", "In Progress", "Done"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "All" && "📋 "}
                  {status === "To Do" && "○ "}
                  {status === "In Progress" && "⟳ "}
                  {status === "Done" && "✓ "}
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Priority Filters */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
                Priority Level
              </label>
              <div className="flex gap-2 flex-wrap">
                {["All Priority", "High", "Medium", "Low"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                      filterPriority === priority
                        ? priority === "High"
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                          : priority === "Medium"
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                          : priority === "Low"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {priority === "High" && "🔴 "}
                    {priority === "Medium" && "🟡 "}
                    {priority === "Low" && "🔵 "}
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
                Assigned User
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all ${
                  darkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600" 
                    : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                } border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="All Users">👥 All Users</option>
                {usersList
                  .filter((u) => u.role?.toLowerCase() !== "admin")
                  .map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.name || u.username}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation/Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className="text-xl font-semibold mb-4">
              {editingId === "new" ? "New Task" : "Edit Task"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Title - Admin only for new tasks, editable for admins editing */}
              {(user?.role?.toLowerCase() === "admin" || editingId !== "new") && (
                <input
                  type="text"
                  placeholder="Task Title"
                  required
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={user?.role?.toLowerCase() !== "admin" && editingId !== "new"}
                />
              )}

              {/* Description - Admin only for new tasks */}
              {(user?.role?.toLowerCase() === "admin" || editingId !== "new") && (
                <textarea
                  placeholder="Task Description"
                  rows="3"
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={user?.role?.toLowerCase() !== "admin" && editingId !== "new"}
                />
              )}

              {/* Assign Users - Admin only - Multi Select */}
              {user?.role?.toLowerCase() === "admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assign Users</label>
                  <MultiSelectDropdown
                    options={usersList
                      .filter((u) => u.role?.toLowerCase() !== "admin")
                      .map((u) => ({
                        id: u.id,
                        value: u.username,
                        label: u.name || u.username,
                      }))}
                    selected={form.assignedTo || []}
                    onChange={(selectedUsers) => setForm({ ...form, assignedTo: selectedUsers })}
                    placeholder="Select users to assign..."
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Status - Everyone can edit */}
              <select
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>

              {/* Priority - Admin only */}
              {user?.role?.toLowerCase() === "admin" && (
                <select
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              )}

              {/* Due Date - Admin only */}
              {user?.role?.toLowerCase() === "admin" && (
                <input
                  type="date"
                  min={today}
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  {editingId === "new" ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      title: "",
                      description: "",
                      assignedTo: [],
                      status: "To Do",
                      priority: "Low",
                      dueDate: "",
                    });
                  }}
                  className={`px-4 py-2 rounded-md border ${
                    darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group relative p-4 rounded-xl shadow-md border-l-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                task.priority === "High"
                  ? darkMode 
                    ? "border-l-rose-500 bg-gradient-to-br from-rose-900/20 to-gray-800/50" 
                    : "border-l-rose-500 bg-gradient-to-br from-rose-50 to-white"
                  : task.priority === "Medium"
                  ? darkMode
                    ? "border-l-amber-500 bg-gradient-to-br from-amber-900/20 to-gray-800/50"
                    : "border-l-amber-500 bg-gradient-to-br from-amber-50 to-white"
                  : darkMode
                    ? "border-l-sky-500 bg-gradient-to-br from-sky-900/20 to-gray-800/50"
                    : "border-l-sky-500 bg-gradient-to-br from-sky-50 to-white"
              }`}
            >
              {/* Priority Corner Badge */}
              <div className="absolute top-0 right-0">
                <div
                  className={`px-3 py-0.5 rounded-bl-xl rounded-tr-xl text-xs font-bold shadow-sm ${
                    task.priority === "High"
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      : task.priority === "Medium"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                  }`}
                >
                  {task.priority}
                </div>
              </div>

              {/* Header */}
              <div className="mb-3 mt-1">
                <h3 className={`font-bold text-lg mb-2 pr-14 leading-tight ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}>{task.title}</h3>
                
                {/* Status Badge with Icon */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                      task.status === "Done"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                        : task.status === "In Progress"
                        ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                        : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
                    }`}
                  >
                    {task.status === "Done" && "✓"}
                    {task.status === "In Progress" && "⟳"}
                    {task.status === "To Do" && "○"}
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm mb-2 line-clamp-2 leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                {task.description || "No description provided"}
              </p>

              {/* Task Info with Icons */}
              <div className={`space-y-2 mb-2 pb-2 border-t pt-2 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">�</span>
                  <div className="flex-1">
                    <div className={`text-xs font-semibold mb-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>Assigned to:</div>
                    {Array.isArray(task.assignedTo) ? (
                      <div className="flex flex-wrap gap-1.5">
                        {task.assignedTo.map((user, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              darkMode 
                                ? "bg-indigo-600 text-indigo-100" 
                                : "bg-indigo-500 text-white"
                            }`}
                          >
                            {user}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}>{task.assignedTo}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📆</span>
                  <div>
                    <div className={`text-xs font-semibold ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>Due Date:</div>
                    <span className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : "No deadline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForm(task);
                      setEditingId(task.id);
                    }}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    ✏️ Edit
                  </button>
                  {user?.role?.toLowerCase() === "admin" && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setCommentModalTask(task)}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  💬 Comments ({task.comments?.length || 0})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className={`inline-block p-8 rounded-2xl ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}>
              <p className="text-6xl mb-4">📋</p>
              <p className="text-xl font-semibold mb-2">No tasks available</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {user?.role?.toLowerCase() === "admin" 
                  ? "Create a new task to get started!" 
                  : "No tasks assigned to you yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Comments Modal */}
      {commentModalTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className={`p-6 rounded-lg w-[400px] shadow-xl ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          }`}>
            <h3 className="text-lg font-semibold mb-3">
              Comments — {commentModalTask.title}
            </h3>

            <div className={`border rounded p-2 max-h-[250px] overflow-y-auto mb-3 ${
              darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              {commentModalTask.comments?.length ? (
                commentModalTask.comments.map((c) => (
                  <div key={c.id} className={`border-b pb-2 mb-2 ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}>
                    <p className={darkMode ? "text-gray-100" : "text-gray-900"}>{c.text}</p>
                    <small className={darkMode ? "text-gray-400" : "text-gray-500"}>
                      — {c.author} • {c.time && !isNaN(new Date(c.time).getTime()) ? new Date(c.time).toLocaleString() : new Date().toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No comments yet.</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add comment..."
                className={`border p-2 rounded flex-1 ${
                  darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                }`}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!commentInput.trim()) return;

                  const newComment = {
                    id: Date.now(),
                    text: commentInput,
                    author: user.username,
                    time: new Date().toISOString(),
                  };

                  addComment(commentModalTask.id, newComment);
                  setCommentInput("");

                  setCommentModalTask((prev) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment],
                  }));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
              >
                Add
              </button>
            </div>

            <button
              className="bg-red-600 hover:bg-red-700 text-white w-full py-2 rounded"
              onClick={() => setCommentModalTask(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Full Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[400px] max-h-[85vh] overflow-hidden shadow-xl">
            <h3 className="text-xl font-semibold mb-3">{selectedTask.title}</h3>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Description:</h4>
              <div className="border rounded p-2 text-sm max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {selectedTask.description || "No description"}
              </div>
            </div>

            <p className="text-sm"><strong>Assigned To:</strong> {selectedTask.assignedTo}</p>
            <p className="text-sm"><strong>Status:</strong> {selectedTask.status}</p>
            <p className="text-sm"><strong>Priority:</strong> {selectedTask.priority}</p>
            <p className="text-sm mb-5">
              <strong>Due Date:</strong>{" "}
              {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "—"}
            </p>

            <button
              onClick={() => setSelectedTask(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}


/* ---------- ANALYTICS TAB ---------- */
function AnalyticsTab({ darkMode }) {
  const [tasks] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem("tasks")); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  const [usersList, setUsersList] = useState([]);
  const [statusFilterUser, setStatusFilterUser] = useState("All Users");
  const [priorityFilterUser, setPriorityFilterUser] = useState("All Users");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsersList(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Filter tasks by user for status chart
  const getFilteredTasksByUser = (filterUser) => {
    if (filterUser === "All Users") return tasks;
    return tasks.filter(task => {
      if (Array.isArray(task.assignedTo)) {
        return task.assignedTo.includes(filterUser);
      }
      return task.assignedTo === filterUser;
    });
  };

  const statusFilteredTasks = getFilteredTasksByUser(statusFilterUser);
  const priorityFilteredTasks = getFilteredTasksByUser(priorityFilterUser);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const todoTasks = tasks.filter(t => t.status === "To Do").length;

  const priorityData = ["High","Medium","Low"].map(priority => ({priority, count: priorityFilteredTasks.filter(t => t.priority === priority).length}));
  const statusData = ["To Do","In Progress","Done"].map(status => ({name: status, value: statusFilteredTasks.filter(t => t.status === status).length}));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white transform transition-all hover:scale-105">
          <h3 className="text-lg font-bold mb-2 opacity-90">Total Tasks</h3>
          <p className="text-4xl font-bold">{totalTasks}</p>
        </div>
        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white transform transition-all hover:scale-105">
          <h3 className="text-lg font-bold mb-2 opacity-90">To Do</h3>
          <p className="text-4xl font-bold">{todoTasks}</p>
        </div>
        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform transition-all hover:scale-105">
          <h3 className="text-lg font-bold mb-2 opacity-90">In Progress</h3>
          <p className="text-4xl font-bold">{inProgressTasks}</p>
        </div>
        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white transform transition-all hover:scale-105">
          <h3 className="text-lg font-bold mb-2 opacity-90">Completed</h3>
          <p className="text-4xl font-bold">{completedTasks}</p>
        </div>
        <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white transform transition-all hover:scale-105">
          <h3 className="text-lg font-bold mb-2 opacity-90">Overdue</h3>
          <p className="text-4xl font-bold">{overdueTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Task Distribution by Status</h3>
            <select
              value={statusFilterUser}
              onChange={(e) => setStatusFilterUser(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600" 
                  : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <option value="All Users">👥 All Users</option>
              {usersList
                .filter((u) => u.role?.toLowerCase() !== "admin")
                .map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.name || u.username}
                  </option>
                ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" outerRadius={100} label>
                {statusData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Tasks by Priority</h3>
            <select
              value={priorityFilterUser}
              onChange={(e) => setPriorityFilterUser(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600" 
                  : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <option value="All Users">👥 All Users</option>
              {usersList
                .filter((u) => u.role?.toLowerCase() !== "admin")
                .map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.name || u.username}
                  </option>
                ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* ---------- ACTIVITY LOG TAB ---------- */
function ActivityLogTab({ darkMode }) {
  const { user } = useAuth();
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("activityLog")) || [];
        // Ensure all logs are in the unified format with user/role/message
        const normalized = saved.map((log) => ({
          id: log.id || Date.now(),
          user: log.user || "System",
          role: log.role || "unknown",
          message: log.message || log.action || "Activity logged",
          timestamp: log.timestamp || new Date().toISOString(),
        }));
        
        // Filter logs to show only the current user's activities
        const userLogs = normalized.filter(log => 
          log.user?.toLowerCase() === user?.username?.toLowerCase()
        );
        
        setActivityLog(userLogs);
      } catch (e) {
        console.error("Error loading activity logs:", e);
        setActivityLog([]);
      }
    };

    loadLogs();

    window.addEventListener("activityLogUpdated", loadLogs);
    window.addEventListener("storage", loadLogs);

    return () => {
      window.removeEventListener("activityLogUpdated", loadLogs);
      window.removeEventListener("storage", loadLogs);
    };
  }, [user]);


  return (
    <>
      {activityLog.length > 0 ? (
        <ul className="space-y-3">

          {activityLog.map((log) => (
            <li
              key={log.id || log.timestamp}
              className={`p-4 rounded-xl border-l-4 shadow-md transition-all hover:shadow-lg ${
                darkMode ? "border-l-blue-500 bg-gray-800 hover:bg-gray-750" : "border-l-blue-500 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold break-words">{log.message || log.action || "Activity"}</div>
              <div className={`text-sm mt-1 break-words ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {log.user ? `${log.user}${log.role ? ` (${log.role})` : ""} • ` : ""}{new Date(log.timestamp || Date.now()).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`text-center py-16 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <p className="text-6xl mb-4">📋</p>
          <p className="text-xl font-semibold mb-2">No activity yet</p>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Activities will appear here as they happen
          </p>
        </div>
      )}
    </>
  );
}

/* ---------- SETTINGS TAB ---------- */
/*
function SettingsTab({ darkMode, addActivityLog }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [message, setMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    addActivityLog(`User profile updated: ${form.name}`);
    setMessage("✅ Profile updated successfully!");
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <h2 className="text-2xl font-semibold mb-5">Settings</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Name"
          className={`border p-2 rounded ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className={`border p-2 rounded ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Save size={16} /> Save Changes
        </button>
      </form>
      {message && <p className="mt-4 text-green-400">{message}</p>}
    </div>
  );
}
*/