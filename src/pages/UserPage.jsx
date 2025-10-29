import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useTheme } from "../context/ThemeContext";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

export default function UserPage() {
  const { user } = useAuth();
const { getUserTasks, updateTask, deleteTask, getUserActivity, addComment } = useTasks();
  const { darkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({
    title: "",
    description: "",
    status: "",
  });
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState(null);
  const [commentInput, setCommentInput] = useState("");

  const userTasks = getUserTasks();
const activityLogs = getUserActivity ? getUserActivity() : [];

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setUpdatedTask({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Pending",
    });
  };

  const handleSave = (id) => {
    updateTask(id, updatedTask);
    setEditingTaskId(null);
  };

  const handleDelete = (id) => {
    if (user.role === "admin") {
      if (window.confirm("Are you sure you want to delete this task?")) {
        deleteTask(id);
      }
    } else {
      alert("Only admins can delete tasks.");
    }
  };

  // Chart data
  const data = [
    {
      name: "Pending",
      value: userTasks.filter((t) => t.status === "Pending").length,
    },
    {
      name: "In Progress",
      value: userTasks.filter((t) => t.status === "In Progress").length,
    },
    {
      name: "Done",
      value: userTasks.filter((t) => t.status === "Done").length,
    },
  ];

  const COLORS = ["#9CA3AF", "#FACC15", "#22C55E"]; // gray, yellow, green

  return (
    <div
      className={`p-6 sm:p-8 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-b from-slate-50 to-sky-50 text-slate-900"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">
        👋 Welcome, {user?.username || "User"}!
      </h1>

      {/* --- Tab Buttons --- */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["dashboard", "tasks", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
              activeTab === tab
                ? (darkMode ? "bg-blue-600 text-white" : "bg-sky-300 text-sky-900")
                : darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {tab === "dashboard"
              ? "📊 Dashboard"
              : tab === "tasks"
              ? "✅ My Tasks"
              : "🧾 My Activity Log"}
          </button>
        ))}
      </div>

      {/* === DASHBOARD TAB === */}
      {activeTab === "dashboard" && (
        <div
          className={`p-6 rounded-2xl shadow ${
            darkMode ? "bg-gray-800" : "bg-white/90 backdrop-blur"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">📊 Dashboard Overview</h2>
          <p
            className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
          >
            Quick visual summary of your tasks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl text-center ${
                darkMode ? "bg-gray-700" : "bg-sky-100 text-sky-900"
              } shadow`}
            >
              <h3 className="text-lg font-semibold">Total Tasks</h3>
              <p className="text-2xl font-bold">{userTasks.length}</p>
            </div>
            <div
              className={`p-4 rounded-xl text-center ${
                darkMode ? "bg-gray-700" : "bg-emerald-100 text-emerald-900"
              } shadow`}
            >
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl font-bold">
                {userTasks.filter((t) => t.status === "Done").length}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl text-center ${
                darkMode ? "bg-gray-700" : "bg-amber-100 text-amber-900"
              } shadow`}
            >
              <h3 className="text-lg font-semibold">In Progress</h3>
              <p className="text-2xl font-bold">
                {userTasks.filter((t) => t.status === "In Progress").length}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* === TASKS TAB === */}
      {activeTab === "tasks" && (
        <div
          className={`p-6 rounded-2xl shadow transition-colors ${
            darkMode ? "bg-gray-800" : "bg-white/90 backdrop-blur"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">✅ My Tasks</h2>

          {userTasks.length === 0 ? (
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              You have no tasks yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {userTasks.map((task) => (
                <li
                  key={task.id}
                  className={`border p-4 rounded-xl transition-colors shadow ${
                    darkMode ? "border-gray-700" : "border-slate-200"
                  }`}
                >
                  {editingTaskId === task.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        className={`w-full p-2 border rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-100 border-gray-300 text-black"
                        }`}
                        value={updatedTask.title}
                        onChange={(e) =>
                          setUpdatedTask({
                            ...updatedTask,
                            title: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className={`w-full p-2 border rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-100 border-gray-300 text-black"
                        }`}
                        value={updatedTask.description}
                        onChange={(e) =>
                          setUpdatedTask({
                            ...updatedTask,
                            description: e.target.value,
                          })
                        }
                      />
                      <select
                        className={`p-2 border rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-100 border-gray-300 text-black"
                        }`}
                        value={updatedTask.status}
                        onChange={(e) =>
                          setUpdatedTask({
                            ...updatedTask,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>

                      <div className="flex space-x-3">
                        <button
                          className={`${darkMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-emerald-200 hover:bg-emerald-300 text-emerald-900"} px-4 py-2 rounded-md`}
                          onClick={() => handleSave(task.id)}
                        >
                          Save
                        </button>
                        <button
                          className={`${darkMode ? "bg-gray-500 hover:bg-gray-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"} px-4 py-2 rounded-md`}
                          onClick={() => setEditingTaskId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {task.description || "No description provided."}
                        </p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                            task.status === "Done"
                              ? "bg-green-200 text-green-800"
                              : task.status === "In Progress"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {task.status || "Pending"}
                        </span>
                        {/* Comments teaser and panel toggle */}
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              setOpenCommentsTaskId(
                                openCommentsTaskId === task.id ? null : task.id
                              );
                            }}
                            className={`${darkMode ? "text-blue-300" : "text-blue-700"} hover:underline`}
                          >
                            {Array.isArray(task.comments) ? `${task.comments.length} comments` : "Add comment"}
                          </button>
                        </div>
                        {openCommentsTaskId === task.id && (
                          <div className={`mt-3 p-3 rounded ${darkMode ? "bg-gray-900" : "bg-slate-50"}`}>
                            <div className="flex gap-2">
                              <input
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Write a comment"
                                className={`flex-1 p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-slate-300"}`}
                              />
                              <button
                                onClick={() => {
                                  if (!commentInput.trim()) return;
                                  addComment(task.id, commentInput.trim());
                                  setCommentInput("");
                                }}
                                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Add
                              </button>
                              <button onClick={() => { setOpenCommentsTaskId(null); setCommentInput(""); }} className={`px-3 py-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-slate-200 text-slate-800"}`}>Close</button>
                            </div>
                            <ul className="space-y-2 mt-3">
                              {(task.comments || []).map((c) => (
                                <li key={c.id} className={`p-2 rounded border ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
                                  <div className="text-sm">{c.text}</div>
                                  <div className="text-xs opacity-70 mt-1">by {c.author} • {new Date(c.createdAt).toLocaleString()}</div>
                                </li>
                              ))}
                              {(!task.comments || task.comments.length === 0) && (
                                <li className="text-sm opacity-70">No comments yet.</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="space-x-2 whitespace-nowrap">
                        <button
                          className={`${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-sky-200 hover:bg-sky-300 text-sky-900"} px-4 py-2 rounded-md`}
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        {user.role === "admin" && (
                          <button
                            className={`${darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-rose-200 hover:bg-rose-300 text-rose-900"} px-4 py-2 rounded-md`}
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* === ACTIVITY LOG TAB === */}
      {activeTab === "activity" && (
        <div
          className={`p-6 rounded-2xl shadow ${
            darkMode ? "bg-gray-800" : "bg-white/90 backdrop-blur"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">🧾 My Activity Log</h2>
          {activityLogs.length === 0 ? (
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              No activity yet.
            </p>
          ) : (
            <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
              {activityLogs.map((log, index) => (
                <li
                  key={log.id || index}
                  className={`border p-3 rounded-lg ${
                    darkMode ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-medium">{log.message || log.action || "Activity"}</p>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {log.user ? `${log.user}${log.role ? ` (${log.role})` : ""} • ` : ""}{new Date(log.timestamp || Date.now()).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
