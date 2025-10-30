import React, { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  BarChart2,
  Settings,
  Menu,
  MessageSquare,
  Shield,
  Save,
} from "lucide-react";
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
      className={`flex h-screen overflow-hidden transition-all duration-300 ${
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
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
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
    <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
  </div>
  <div></div>
</header>
        {/* Tabs */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
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

  //Fetch users from Firestore
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //Add / Update user
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
    <div>
      <h2 className="text-2xl font-semibold mb-5">User Management</h2>

      <form
        onSubmit={handleSubmit}
        className={`flex flex-wrap gap-3 mb-6 p-4 rounded-xl shadow 
          ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}
      >
        <input
          type="text"
          placeholder="Username"
          className={`border p-2 rounded flex-1 ${darkMode ? "bg-gray-700" : "bg-white"}`}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className={`border p-2 rounded flex-1 ${darkMode ? "bg-gray-700" : "bg-white"}`}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        
        {!editingUser && (
          <input
            type="password"
            placeholder="Password"
            className={`border p-2 rounded flex-1 ${darkMode ? "bg-gray-700" : "bg-white"}`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        )}

        <select
          className={`border p-2 rounded ${darkMode ? "bg-gray-700" : "bg-white"}`}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          {editingUser ? "Update User" : "Add User"}
        </button>
      </form>

      {/* Users list */}
      <div className={`rounded-lg shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <table className="w-full text-sm">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <tr>
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => handleEdit(u)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="4" className="text-center p-4 text-gray-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
    assignedTo: "",
    status: "To Do",
    priority: "Low",
    dueDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentModalTask, setCommentModalTask] = useState(null);

  const safeTasks = tasks || [];
  const visibleTasks =
    user?.role?.toLowerCase() === "admin"
      ? safeTasks
      : safeTasks.filter(
          (t) => t.assignedTo?.toLowerCase() === user?.username?.toLowerCase()
        );

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
    if (!form.title || !form.assignedTo) return;

    const normalizedStatus =
      form.status.toLowerCase() === "completed" ? "Done" : form.status;

    if (editingId) {
      updateTask(editingId, { ...form, status: normalizedStatus });
      setEditingId(null);
    } else {
      addTask({
        ...form,
        id: Date.now(),
        comments: [],
        status: normalizedStatus,
      });
    }

    setForm({
      title: "",
      description: "",
      assignedTo: "",
      status: "To Do",
      priority: "Low",
      dueDate: "",
    });
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  return (
    <div
      className={`p-4 sm:p-6 rounded-xl ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h2 className="text-2xl font-semibold mb-5">Task Management</h2>

      {/* Admin Create Task Form */}
      {user?.role?.toLowerCase() === "admin" && (
        <>
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 p-4 rounded-xl shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <input
              type="text"
              placeholder="Task Title"
              className={`border p-2 rounded col-span-2 ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              placeholder="Task Description"
              className={`border p-2 rounded col-span-2 ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

           {/*Dropdown -Users */}
<select
  className={`border p-2 rounded ${
    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
  }`}
  value={form.assignedTo}
  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
>
  <option value="">Assign User</option>

  {usersList
    .filter((u) => u.role?.toLowerCase() !== "admin") // ❌ Remove admins
    .map((u) => (
      <option key={u.id} value={u.username}>
        {u.name || u.username}
      </option>
    ))}
</select>


            <select
              className={`border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>

            <select
              className={`border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              min={today}
              className={`border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {editingId ? "Update" : "Add"}
            </button>
          </form>
                    {/* Tasks Table */}
          <div
            className={`overflow-x-auto rounded-lg shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <table className="w-full text-sm sm:text-base">
              <thead
                className={`${
                  darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100"
                }`}
              >
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Assigned To</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Priority</th>
                  <th className="px-4 py-2">Due Date</th>
                  <th className="px-4 py-2">Comments</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleTasks.length ? (
                  visibleTasks.map((task) => (
                    <tr
                      key={task.id}
                      className={darkMode ? "border-b border-gray-700" : "border-b"}
                    >
                      <td
                        className="px-4 py-2 text-blue-600 underline cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.title}
                      </td>

                      <td className="px-4 py-2">{task.description || "—"}</td>
                      <td className="px-4 py-2">{task.assignedTo}</td>
                      <td className="px-4 py-2">{task.status}</td>
                      <td className="px-4 py-2">{task.priority}</td>
                      <td className="px-4 py-2">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                      </td>

                      {/* Open Comments Popup */}
                      <td
                        className="px-4 py-2 text-blue-500 underline cursor-pointer"
                        onClick={() => setCommentModalTask(task)}
                      >
                        {task.comments?.length || 0} comments
                      </td>

                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => {
                            setForm(task);
                            setEditingId(task.id);
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="text-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No tasks available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ✅ Comments Modal */}
      {commentModalTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              Comments — {commentModalTask.title}
            </h3>

            <div className="border rounded p-2 max-h-[250px] overflow-y-auto mb-3 bg-gray-50 dark:bg-gray-900">
              {commentModalTask.comments?.length ? (
                commentModalTask.comments.map((c) => (
                  <div key={c.id} className="border-b pb-2 mb-2 dark:border-gray-700">
                    <p>{c.text}</p>
                    <small className="text-gray-500">
                      — {c.author} • {new Date(c.time).toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add comment..."
                className="border p-2 rounded flex-1 dark:bg-gray-700 dark:text-white"
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
              className="bg-red-600 text-white w-full py-2 rounded"
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
    </div>
  );
}


/* ---------- ANALYTICS TAB ---------- */
function AnalyticsTab({ darkMode }) {
  const [tasks] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem("tasks")); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredTasks = filterStatus === "All" ? tasks : tasks.filter(t => t.status === filterStatus);

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === "Done").length;
  const overdueTasks = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done").length;

  const priorityData = ["High","Medium","Low"].map(priority => ({priority, count: filteredTasks.filter(t => t.priority === priority).length}));
  const statusData = ["To Do","In Progress","Done"].map(status => ({name: status, value: filteredTasks.filter(t => t.status === status).length}));

  return (
    <div className={`p-6 space-y-6 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"}`}>
      <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>

      <div className="flex gap-3 mt-4">
        {["All","To Do","In Progress","Done"].map(status => (
          <button
            key={status}
            className={`px-4 py-2 rounded ${filterStatus === status
              ? (darkMode ? "bg-blue-500 text-white" : "bg-sky-300 text-sky-900")
              : darkMode
                ? "bg-gray-700 text-gray-100"
                : "bg-slate-200 text-slate-700"}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-blue-500 text-white" : "bg-sky-200 text-sky-900"}`}>
          <h3 className="text-lg font-medium">Total Tasks</h3>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-green-500 text-white" : "bg-emerald-200 text-emerald-900"}`}>
          <h3 className="text-lg font-medium">Completed Tasks</h3>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${darkMode ? "bg-red-500 text-white" : "bg-rose-200 text-rose-900"}`}>
          <h3 className="text-lg font-medium">Overdue Tasks</h3>
          <p className="text-2xl font-bold">{overdueTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
          <h3 className="font-semibold mb-4">Task Distribution by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" outerRadius={100} label>
                {statusData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
          <h3 className="font-semibold mb-4">Tasks by Priority</h3>
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
    </div>
  );
}

/* ---------- ACTIVITY LOG TAB ---------- */
function ActivityLogTab({ darkMode }) {
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
        setActivityLog(normalized);
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
  }, []);


  return (
    <div className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
      {activityLog.length > 0 ? (
        <ul className="space-y-3">

          {activityLog.map((log) => (
            <li
              key={log.id || log.timestamp}
              className={`p-3 rounded-lg border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="font-medium">{log.message || log.action || "Activity"}</div>
              <div className="text-sm text-gray-400">
                {log.user ? `${log.user}${log.role ? ` (${log.role})` : ""} • ` : ""}{new Date(log.timestamp || Date.now()).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No activity yet.</p>
      )}
    </div>
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