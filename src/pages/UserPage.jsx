import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useTheme } from "../context/ThemeContext";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

export default function UserPage() {
  const { user } = useAuth();
const { getUserTasks, updateTask, deleteTask, getUserActivity } = useTasks();
  const { darkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({
    title: "",
    description: "",
    status: "",
  });

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
      className={`p-8 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">
        👋 Welcome, {user?.username || "User"}!
      </h1>

      {/* --- Tab Buttons --- */}
      <div className="flex space-x-4 mb-6">
        {["dashboard", "tasks", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-700"
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
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">📊 Dashboard Overview</h2>
          <p
            className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
          >
            Quick visual summary of your tasks.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl text-center ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3 className="text-lg font-semibold">Total Tasks</h3>
              <p className="text-2xl font-bold">{userTasks.length}</p>
            </div>
            <div
              className={`p-4 rounded-xl text-center ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl font-bold">
                {userTasks.filter((t) => t.status === "Done").length}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl text-center ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
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
            darkMode ? "bg-gray-800" : "bg-white"
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
                  className={`border p-4 rounded-xl transition-colors ${
                    darkMode ? "border-gray-700" : "border-gray-300"
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
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          onClick={() => handleSave(task.id)}
                        >
                          Save
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                          onClick={() => setEditingTaskId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
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
                      </div>
                      <div className="space-x-2">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        {user.role === "admin" && (
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">🧾 My Activity Log</h2>
          {activityLogs.length === 0 ? (
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              No activity yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {activityLogs.map((log, index) => (
                <li
                  key={index}
                  className={`border p-3 rounded-lg ${
                    darkMode ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <p className="font-medium">{log.message}</p>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {new Date(log.timestamp).toLocaleString()}
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
