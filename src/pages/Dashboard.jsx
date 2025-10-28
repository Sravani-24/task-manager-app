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

const COLORS = ["#3B82F6", "#22C55E", "#FACC15", "#EF4444"];

/* ---------- ACTIVITY LOGGER ---------- */
function addActivityLog(action) {
  const existingLogs = JSON.parse(localStorage.getItem("activityLog")) || [];
  const newLog = {
    id: Date.now(),
    action,
    timestamp: new Date().toLocaleString(),
  };
  const updatedLogs = [newLog, ...existingLogs];
  localStorage.setItem("activityLog", JSON.stringify(updatedLogs));

  // 🚀 Trigger an event so other components update instantly
  window.dispatchEvent(new Event("activityLogUpdated"));
}

/* ---------- DASHBOARD COMPONENT ---------- */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const menuItems = isAdmin
    ? [
        { key: "users", label: "Users", icon: <Users size={18} /> },
        { key: "tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
        { key: "activity", label: "Activity Log", icon: <MessageSquare size={18} /> },
        { key: "settings", label: "Settings", icon: <Settings size={18} /> },
      ]
    : [
        { key: "tasks", label: "My Tasks", icon: <ClipboardList size={18} /> },
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
        { key: "settings", label: "Settings", icon: <Settings size={18} /> },
      ];

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* ---------- SIDEBAR ---------- */}
      <div
        className={`fixed md:static z-20 top-0 left-0 h-full transition-transform transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${
            darkMode ? "bg-gray-900 border-r border-gray-800" : "bg-white border-r border-gray-200"
          } w-64 shadow-lg`}
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Task Manager</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-600">
            ✕
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg font-medium transition-all
                ${
                  activeTab === item.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : darkMode
                    ? "hover:bg-gray-800 hover:text-white"
                    : "hover:bg-blue-100 text-gray-700"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header
          className={`flex items-center justify-between p-4 border-b 
          ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-700">
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
        </header>

        {/* Tab Content */}
        <main className="p-6 flex-1 overflow-y-auto">
          {activeTab === "users" && <UsersTab darkMode={darkMode} />}
          {activeTab === "tasks" && <TasksTab darkMode={darkMode} />}
          {activeTab === "analytics" && <AnalyticsTab darkMode={darkMode} />}
          {activeTab === "activity" && <ActivityLogTab darkMode={darkMode} />}
          {activeTab === "settings" && <SettingsTab darkMode={darkMode} />}
        </main>
      </div>
    </div>
  );
}

/* ---------- USERS TAB ---------- */
function UsersTab({ darkMode }) {
  const { users, setUsers } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", role: "User" });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    if (editingId) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
      addActivityLog(`User updated: ${form.name}`);
      setEditingId(null);
    } else {
      setUsers([...users, { id: Date.now(), ...form }]);
      addActivityLog(`New user added: ${form.name}`);
    }
    setForm({ name: "", email: "", role: "User" });
  };

  const handleEdit = (u) => {
    setForm(u);
    setEditingId(u.id);
  };

  const handleDelete = (id) => {
    const deletedUser = users.find((u) => u.id === id);
    setUsers(users.filter((u) => u.id !== id));
    addActivityLog(`User deleted: ${deletedUser?.name || id}`);
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
          placeholder="Name"
          className={`border p-2 rounded flex-1 focus:outline-none 
            ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className={`border p-2 rounded flex-1 focus:outline-none 
            ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select
          className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option>User</option>
          <option>Admin</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      <div className={`overflow-x-auto rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <table className="min-w-full border-collapse">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"} text-left`}>
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr
                  key={u.id}
                  className={`border-b ${
                    darkMode ? "border-gray-700 hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEdit(u)} className="text-blue-400 hover:text-blue-600">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-600">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TasksTab({ darkMode }) {
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [form, setForm] = useState({
    title: "",
    assignedTo: "",
    status: "To Do",
    priority: "Low",
    dueDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [expandedTask, setExpandedTask] = useState(null);

  const visibleTasks =
    user?.role?.toLowerCase() === "admin"
      ? tasks
      : tasks.filter(
          (t) => t.assignedTo?.toLowerCase() === user?.username?.toLowerCase()
        );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo) return;

    let normalizedStatus = form.status;
    if (normalizedStatus.toLowerCase() === "completed") normalizedStatus = "Done";

    if (editingId) {
      updateTask(editingId, { ...form, status: normalizedStatus });
      addActivityLog(`Task updated: ${form.title}`);
      setEditingId(null);
    } else {
      addTask({ ...form, id: Date.now(), comments: [], status: normalizedStatus });
      addActivityLog(`Task created: ${form.title}`);
    }

    setForm({
      title: "",
      assignedTo: "",
      status: "To Do",
      priority: "Low",
      dueDate: "",
    });
  };

  const handleDelete = (id) => {
    const deletedTask = tasks.find((t) => t.id === id);
    deleteTask(id);
    addActivityLog(`Task deleted: ${deletedTask?.title || id}`);
  };

  /* ---------------- COMMENT HANDLER ---------------- */
  const handleAddComment = (taskId) => {
    if (!commentInput.trim()) return;

    const task = tasks.find((t) => t.id === taskId);
    const newComment = {
      id: Date.now(),
      text: commentInput,
      author: user?.username || user?.email || "Unknown",
      timestamp: new Date().toLocaleString(),
    };

    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), newComment],
    };

    updateTask(taskId, updatedTask);
    addActivityLog(`New comment on "${task.title}" by ${newComment.author}`);
    setCommentInput("");
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <h2 className="text-2xl font-semibold mb-5">Task Management</h2>

      {/* ---------- ADMIN TASK FORM ---------- */}
      {user?.role?.toLowerCase() === "admin" && (
        <form
          onSubmit={handleSubmit}
          className={`flex flex-wrap gap-3 mb-6 p-4 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <input
            type="text"
            placeholder="Task Title"
            className={`border p-2 rounded flex-1 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Assigned To"
            className={`border p-2 rounded flex-1 ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          />
          <select
            className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <select
            className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input
            type="date"
            className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            {editingId ? "Update" : "Add"}
          </button>
        </form>
      )}

      {/* ---------- TASK TABLE ---------- */}
      <div className={`overflow-x-auto rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <table className="w-full border-collapse">
          <thead className={`${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Status</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Comments</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.length > 0 ? (
              visibleTasks.map((t) => (
                <React.Fragment key={t.id}>
                  <tr
                    className={`${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-b hover:bg-gray-50"}`}
                  >
                    <td className="p-3">{t.title}</td>
                    <td className="p-3">{t.assignedTo}</td>
                    <td className="p-3">{t.status}</td>
                    <td className="p-3">{t.priority}</td>
                    <td className="p-3">{t.dueDate}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                        className="text-blue-500 hover:underline"
                      >
                        {expandedTask === t.id ? "Hide" : "View"} ({t.comments?.length || 0})
                      </button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600">
                        🗑️
                      </button>
                    </td>
                  </tr>

                  {/* ---------- COMMENTS SECTION ---------- */}
                  {expandedTask === t.id && (
                    <tr>
                      <td colSpan="7" className={`p-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                        <div className="space-y-3">
                          <h4 className="font-semibold mb-2">Comments</h4>

                          {t.comments && t.comments.length > 0 ? (
                            <ul className="space-y-2">
                              {t.comments.map((c) => (
                                <li
                                  key={c.id}
                                  className={`p-2 rounded border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                                >
                                  <div className="text-sm text-gray-400">
                                    <strong>{c.author}</strong> • {c.timestamp}
                                  </div>
                                  <div>{c.text}</div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 italic">No comments yet.</p>
                          )}

                          {/* Add Comment Box */}
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              className={`flex-1 p-2 border rounded ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                            />
                            <button
                              onClick={() => handleAddComment(t.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400 italic">
                  No tasks available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
              ? "bg-blue-500 text-white"
              : darkMode
                ? "bg-gray-700 text-gray-100"
                : "bg-gray-200 text-gray-700"}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Total Tasks</h3>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className="p-4 bg-green-500 text-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Completed Tasks</h3>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <div className="p-4 bg-red-500 text-white rounded-lg shadow">
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
    const saved = JSON.parse(localStorage.getItem("activityLog")) || [];
    setActivityLog(saved);
  };

  loadLogs();

  // 🔁 Listen for both localStorage + custom event changes
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
        <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
          {activityLog.map((log) => (
            <li
              key={log.id}
              className={`p-3 rounded-lg border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="font-medium">{log.action}</div>
              <div className="text-sm text-gray-400">{log.timestamp}</div>
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
function SettingsTab({ darkMode }) {
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
