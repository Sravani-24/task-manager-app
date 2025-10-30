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
  const [updatedTask, setUpdatedTask] = useState({ title: "", description: "", status: "" });
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState(null);
  const [commentInput, setCommentInput] = useState("");

  const userTasks = getUserTasks();
  const activityLogs = getUserActivity ? getUserActivity() : [];

  const data = [
    { name: "To Do", value: userTasks.filter(t => t.status === "To Do").length },
    { name: "In Progress", value: userTasks.filter(t => t.status === "In Progress").length },
    { name: "Done", value: userTasks.filter(t => t.status === "Done").length },
  ];

  const COLORS = ["#9CA3AF", "#FACC15", "#22C55E"];

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setUpdatedTask({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "To Do",
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

  return (
    <div
      className={`p-4 sm:p-8 min-h-screen overflow-y-auto pb-24 
      ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-b from-slate-50 to-sky-50 text-slate-900"}`}
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        👋 Welcome, {user?.username || "User"}!
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["dashboard", "tasks", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base font-semibold capitalize ${
              activeTab === tab
                ? darkMode ? "bg-blue-600 text-white" : "bg-sky-300 text-sky-900"
                : darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-200 text-slate-700"
            }`}
          >
            {tab === "dashboard" ? "📊 Dashboard" : tab === "tasks" ? "✅ My Tasks" : "🧾 My Activity Log"}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className={`p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">📈 Dashboard Overview</h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
            Quick summary of your tasks
          </p>

          {/* Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card title="Total" value={userTasks.length} color={darkMode ? "bg-gray-700" : "bg-blue-100"} />
            <Card title="To Do" value={data[0].value} color={darkMode ? "bg-gray-700" : "bg-gray-200"} />
            <Card title="In Progress" value={data[1].value} color={darkMode ? "bg-gray-700" : "bg-amber-100"} />
            <Card title="Done" value={data[2].value} color={darkMode ? "bg-gray-700" : "bg-emerald-100"} />
          </div>
        </div>
      )}

      {/* TASKS */}
      {activeTab === "tasks" && (
        <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">✅ My Tasks</h2>

          {userTasks.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No tasks available.</p>
          ) : (
            <ul className="space-y-3">
              {userTasks.map(task => (
                <TaskItem key={task.id} {...{task, darkMode, editingTaskId, updatedTask, commentInput,
                  openCommentsTaskId, setUpdatedTask, setCommentInput, setEditingTaskId,
                  setOpenCommentsTaskId, handleEdit, handleSave, handleDelete, addComment, user}} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ACTIVITY */}
      {activeTab === "activity" && (
        <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">🧾 My Activity Log</h2>

          {activityLogs.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No activity yet.</p>
          ) : (
            <ul className="space-y-3 max-h-[65vh] overflow-y-auto">
              {activityLogs.map((log, i) => (
                <li key={i} className={`border p-3 rounded-lg text-sm ${
                    darkMode ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-200"
                  }`}>
                  <p className="font-medium">{log.message}</p>
                  <span className={`text-xs opacity-75`}>
                    {log.user} • {new Date(log.timestamp).toLocaleString()}
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

/* Card Component */
function Card({ title, value, color }) {
  return (
    <div className={`p-3 sm:p-4 rounded-xl text-center shadow ${color}`}>
      <h3 className="text-sm sm:text-lg font-semibold">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </div>
  );
}

/* Task Component */
function TaskItem({
  task, darkMode, editingTaskId, updatedTask, commentInput, openCommentsTaskId,
  setUpdatedTask, setCommentInput, setEditingTaskId, setOpenCommentsTaskId,
  handleEdit, handleSave, handleDelete, addComment, user
}) {
  return (
    <li className={`border p-4 rounded-xl shadow text-sm sm:text-base ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
    }`}>
      {editingTaskId === task.id ? (
        <div className="space-y-3">
          <input type="text"
            className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
            value={updatedTask.title} onChange={(e)=>setUpdatedTask({...updatedTask,title:e.target.value})}
          />

          <textarea
            className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
            value={updatedTask.description}
            onChange={(e)=>setUpdatedTask({...updatedTask,description:e.target.value})}
          />

          <select
            className={`p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
            value={updatedTask.status} onChange={(e)=>setUpdatedTask({...updatedTask,status:e.target.value})}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <div className="flex gap-2">
            <button className={`${darkMode ? "bg-green-600" : "bg-green-300"} px-4 py-2 rounded-md`}
              onClick={()=>handleSave(task.id)}>Save</button>
            <button className={`${darkMode ? "bg-gray-600" : "bg-gray-300"} px-4 py-2 rounded-md`}
              onClick={()=>setEditingTaskId(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-xs opacity-80 mt-1">{task.description}</p>

          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
            task.status==="Done" ? "bg-green-200 text-green-800"
            : task.status==="In Progress" ? "bg-yellow-200 text-yellow-800"
            : "bg-gray-200 text-gray-800"
          }`}>
            {task.status}
          </span>

          {/* Comments */}
          <div className="mt-2">
            <button onClick={()=>setOpenCommentsTaskId(openCommentsTaskId===task.id?null:task.id)}
              className={`${darkMode?"text-blue-300":"text-blue-700"} text-xs sm:text-sm`}>
              {Array.isArray(task.comments)?`${task.comments.length} comments`:"Add comment"}
            </button>
          </div>

          {openCommentsTaskId===task.id && (
            <div className={`mt-3 p-3 rounded ${darkMode?"bg-gray-900":"bg-slate-100"}`}>
              <div className="flex gap-2">
                <input value={commentInput}
                  onChange={(e)=>setCommentInput(e.target.value)}
                  placeholder="Write comment"
                  className={`flex-1 p-2 border rounded ${darkMode?"bg-gray-800 border-gray-700":"bg-white border-slate-300"}`}
                />
                <button className="px-3 py-2 bg-blue-600 text-white rounded"
                  onClick={()=>{ if(!commentInput.trim())return;
                    addComment(task.id,commentInput.trim()); setCommentInput(""); }}>
                  Add
                </button>
                <button className={`px-3 py-2 rounded ${darkMode?"bg-gray-700 text-white":"bg-gray-300 text-black"}`}
                  onClick={()=>{ setOpenCommentsTaskId(null); setCommentInput(""); }}>Close</button>
              </div>

              <ul className="mt-2 space-y-2">
                {(task.comments||[]).map((c)=>(
                  <li key={c.id} className={`p-2 border rounded text-xs ${darkMode?"border-gray-700":"border-slate-200"}`}>
                    {c.text}
                    <div className="text-[10px] opacity-70 mt-1">{c.author} • {new Date(c.createdAt).toLocaleString()}</div>
                  </li>
                ))}
                {(!task.comments || task.comments.length===0) && <li className="text-xs opacity-70">No comments yet.</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button className={`${darkMode?"bg-blue-600":"bg-sky-200"} px-3 py-1 rounded`} onClick={()=>handleEdit(task)}>Edit</button>
            {user.role==="admin" && (
              <button className={`${darkMode?"bg-red-600":"bg-red-200"} px-3 py-1 rounded`}
                onClick={()=>handleDelete(task.id)}>Delete</button>
            )}
          </div>
        </>
      )}
    </li>
  );
}
