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

/* ---------- DASHBOARD COMPONENT ---------- */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { addActivity } = useTasks();

  // Unified activity logger - includes user context and persists properly
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
    // Also use TaskContext's addActivity for consistency
    addActivity(message);
  };

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
      className={`flex h-screen flex-col md:flex-row transition-all duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Mobile overlay to close sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-10"
          aria-hidden="true"
        />
      )}
      {/* ---------- SIDEBAR ---------- */}
      <div
        className={`fixed md:static z-20 top-0 left-0 h-full transition-transform transform
          ${sidebarOpen ? "translate-x-0 md:block" : "-translate-x-full md:hidden"}
          ${
            darkMode
              ? "bg-gray-900 border-r border-gray-800"
              : "bg-gradient-to-b from-sky-50 to-indigo-50 border-r border-slate-200"
          } w-[80vw] sm:w-64 shadow-lg`}
      >
        <div className={`p-5 border-b ${darkMode ? "border-gray-800" : "border-slate-200"} flex items-center justify-between`}>
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
                    ? (darkMode ? "bg-blue-600 text-white shadow-sm" : "bg-sky-200 text-sky-900 shadow-sm")
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
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header
          className={`flex items-center justify-start gap-3 p-4 border-b sticky top-0 z-10 
          ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white/80 backdrop-blur border-slate-200"}`}
        >
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700">
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
        </header>

        {/* Tab Content */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {activeTab === "users" && <UsersTab darkMode={darkMode} addActivityLog={addActivityLog} />}
          {activeTab === "tasks" && <TasksTab darkMode={darkMode} addActivityLog={addActivityLog} />}
          {activeTab === "analytics" && <AnalyticsTab darkMode={darkMode} />}
          {activeTab === "activity" && <ActivityLogTab darkMode={darkMode} />}
          {activeTab === "settings" && <SettingsTab darkMode={darkMode} addActivityLog={addActivityLog} />}
        </main>
      </div>
    </div>
  );
}

/* ---------- USERS TAB ---------- */
function UsersTab({ darkMode, addActivityLog }) {
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
      // default password for users created here
      const username = form.name?.toLowerCase().replace(/\s+/g, "") || form.email.split("@")[0];
      setUsers([...users, { id: Date.now(), name: form.name, username, email: form.email, role: form.role.toLowerCase(), password: "1234" }]);
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

      {/* Users List */}
      <div className={`overflow-x-auto rounded-lg shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <table className="w-full text-sm sm:text-base border-collapse">
          <thead className={`${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <td className="px-4 py-2">{u.name || u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-gray-500">No users found.</td>
              </tr>
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
  const { tasks, addTask, updateTask, deleteTask, addComment, updateComment, deleteComment } = useTasks();
  const [form, setForm] = useState({
    title: "",
    assignedTo: "",
    status: "To Do",
    priority: "Low",
    dueDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [commentTaskId, setCommentTaskId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);

  const visibleTasks =
    user?.role?.toLowerCase() === "admin"
      ? tasks
      : tasks.filter((t) => t.assignedTo?.toLowerCase() === user?.username?.toLowerCase());

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

    setForm({ title: "", assignedTo: "", status: "To Do", priority: "Low", dueDate: "" });
  };

const localToday = new Date();
localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
const today = localToday.toISOString().split("T")[0];

  return (
  <div
    className={`p-4 sm:p-6 rounded-xl ${
      darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
    }`}
  >
    <h2 className="text-2xl font-semibold mb-5">Task Management</h2>

    {/* ---------- ADMIN TASK FORM ---------- */}
    {user?.role?.toLowerCase() === "admin" && (
      <>
        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 p-4 rounded-xl shadow w-full ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <input
            type="text"
            placeholder="Task Title"
            className={`border p-2 rounded col-span-2 ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
            }`}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="text"
            placeholder="Assigned To"
            className={`border p-2 rounded col-span-1 ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
            }`}
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          />

          <select
            className={`border p-2 rounded col-span-1 ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
            }`}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <select
            className={`border p-2 rounded col-span-1 ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
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
            className={`border p-2 rounded col-span-1 ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
            }`}
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md col-span-1"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        {/* ---------- TASK LIST ---------- */}
        <div
          className={`overflow-x-auto rounded-lg shadow w-full ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <table className="w-full text-sm sm:text-base border-collapse">
            <thead
              className={`${
                darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"
              }`}
            >
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Assigned To</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Comments</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No tasks available.
                  </td>
                </tr>
              ) : (
                visibleTasks.map((task) => (
                  <React.Fragment key={task.id}>
                  <tr
                    className={`border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2">{task.assignedTo}</td>
                    <td className="px-4 py-2">{task.status}</td>
                    <td className="px-4 py-2">{task.priority}</td>
                    <td className="px-4 py-2">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => { setCommentTaskId(task.id); setEditingCommentId(null); setCommentInput(""); }}
                        className={`${darkMode ? "text-blue-300" : "text-blue-700"} hover:underline`}
                      >
                        {Array.isArray(task.comments) ? `${task.comments.length} comments` : "Add comment"}
                      </button>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setForm(task);
                          setEditingId(task.id);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {commentTaskId === task.id && (
                    <tr className={`${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>
                      <td colSpan="7" className="px-4 py-3">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder={editingCommentId ? "Update comment" : "Write a comment"}
                              className={`flex-1 p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-slate-300"}`}
                            />
                            <button
                              onClick={() => {
                                if (!commentInput.trim()) return;
                                if (editingCommentId) {
                                  updateComment(task.id, editingCommentId, commentInput.trim());
                                  addActivityLog(`Comment updated on task: ${task.title || task.id}`);
                                } else {
                                  // If user prefixed input with @author, attempt to thread under last selected edited comment
                                  const potentialParent = editingCommentId ? editingCommentId : null;
                                  addComment(task.id, commentInput.trim(), potentialParent);
                                  addActivityLog(`Comment added on task: ${task.title || task.id}`);
                                }
                                setCommentInput("");
                                setEditingCommentId(null);
                              }}
                              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                              {editingCommentId ? "Update" : "Add"}
                            </button>
                            <button onClick={() => { setCommentTaskId(null); setCommentInput(""); setEditingCommentId(null); }} className={`px-3 py-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-slate-200 text-slate-800"}`}>Close</button>
                          </div>
                          {(() => {
                            const buildTree = (comments) => {
                              const nodesById = new Map();
                              const roots = [];
                              (comments || []).forEach((c) => nodesById.set(c.id, { ...c, children: [] }));
                              nodesById.forEach((node) => {
                                if (node.parentId && nodesById.has(node.parentId)) {
                                  nodesById.get(node.parentId).children.push(node);
                                } else {
                                  roots.push(node);
                                }
                              });
                              return roots;
                            };
                            const tree = buildTree(task.comments);
                            const RenderNode = ({ node, level = 0 }) => (
                              <li className={`p-2 rounded border ${darkMode ? "border-gray-700" : "border-slate-200"} ${level ? "ml-6" : ""}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">{node.author}</div>
                                    <div className="text-xs opacity-70">{new Date(node.createdAt).toLocaleString()}</div>
                                  </div>
                                  <div className="space-x-2">
                                    <button onClick={() => { setEditingCommentId(node.id); setCommentInput(node.text); }} className={`${darkMode ? "text-blue-300" : "text-blue-700"} hover:underline`}>Edit</button>
                                    <button onClick={() => setCommentInput(`@${node.author} `)} className={`${darkMode ? "text-emerald-300" : "text-emerald-700"} hover:underline`}>Reply</button>
                                    {user?.role?.toLowerCase() === "admin" && (
                                      <button onClick={() => { deleteComment(task.id, node.id); addActivityLog(`Comment deleted on task: ${task.title || task.id}`); }} className={`${darkMode ? "text-red-300" : "text-red-700"} hover:underline`}>Delete</button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm">{node.text}</div>
                                {node.children?.length > 0 && (
                                  <ul className="space-y-2 mt-2">
                                    {node.children.map((child) => (
                                      <RenderNode key={child.id} node={child} level={level + 1} />
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                            return (
                              <ul className="space-y-2">
                                {tree.length > 0 ? tree.map((n) => <RenderNode key={n.id} node={n} />) : <li className="text-sm opacity-70">No comments yet.</li>}
                              </ul>
                            );
                          })()}
                          <div className="text-xs opacity-70">Tip: To reply to a specific comment, click Reply; your next Add will nest under that comment.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
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
