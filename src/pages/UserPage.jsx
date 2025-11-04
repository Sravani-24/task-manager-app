import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useTheme } from "../context/ThemeContext";
import { LayoutDashboard, CheckSquare, Users, Activity, Menu } from "lucide-react";

export default function UserPage() {
  const { user } = useAuth();
  const { getUserTasks, updateTask, deleteTask, getUserActivity, addComment } = useTasks();
  const { darkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({ title: "", description: "", status: "" });
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [userTeams, setUserTeams] = useState([]);

  const userTasks = getUserTasks();
  const activityLogs = getUserActivity ? getUserActivity() : [];

  // Fetch teams where the user is a member
  useEffect(() => {
    const loadUserTeams = () => {
      try {
        const allTeams = JSON.parse(localStorage.getItem("teams")) || [];
        const myTeams = allTeams.filter(team => 
          team.members && team.members.includes(user?.username)
        );
        setUserTeams(myTeams);
      } catch (e) {
        console.error("Error loading teams:", e);
        setUserTeams([]);
      }
    };
    if (user?.username) {
      loadUserTeams();
    }
  }, [user?.username]);

  // Separate individual and group tasks
  const individualTasks = userTasks.filter(task => {
    if (Array.isArray(task.assignedTo)) {
      return task.assignedTo.length === 1;
    }
    return true; // Single string assignedTo is individual
  });

  const groupTasks = userTasks.filter(task => {
    if (Array.isArray(task.assignedTo)) {
      return task.assignedTo.length > 1;
    }
    return false;
  });

  const data = [
    { name: "To Do", value: userTasks.filter(t => t.status === "To Do").length },
    { name: "In Progress", value: userTasks.filter(t => t.status === "In Progress").length },
    { name: "Done", value: userTasks.filter(t => t.status === "Done").length },
  ];

  // --- Due soon / overdue calculations ---
  const parseLocalDate = (d) => {
    if (!d) return null;
    // Expecting YYYY-MM-DD, convert to local Date
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day, 23, 59, 59, 999);
    }
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const inSevenDays = new Date(startOfToday);
  inSevenDays.setDate(inSevenDays.getDate() + 7);

  const withValidDeadline = (t) => t.dueDate && parseLocalDate(t.dueDate);

  const dueSoonTasks = userTasks
    .filter((t) => withValidDeadline(t) && t.status !== "Done")
    .filter((t) => {
      const due = parseLocalDate(t.dueDate);
      return due >= startOfToday && due <= inSevenDays;
    })
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));

  const overdueTasks = userTasks
    .filter((t) => withValidDeadline(t) && t.status !== "Done")
    .filter((t) => parseLocalDate(t.dueDate) < startOfToday)
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));

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

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "tasks", label: "My Tasks", icon: <CheckSquare size={18} /> },
    { key: "myTeams", label: "My Teams", icon: <Users size={18} /> },
    { key: "groupTasks", label: "Group Tasks", icon: <Users size={18} /> },
    { key: "activity", label: "Activity Log", icon: <Activity size={18} /> },
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
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
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
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-semibold capitalize">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "tasks" && "My Tasks"}
              {activeTab === "myTeams" && "My Teams"}
              {activeTab === "groupTasks" && "Group Tasks"}
              {activeTab === "activity" && "Activity Log"}
            </h1>
          </div>
          <div></div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            👋 Welcome, {user?.username || "User"}!
          </h1>

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

          {/* Due Soon & Overdue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Due soon (next 7 days) */}
            <div className={`${darkMode ? "bg-gray-900/40" : "bg-slate-100"} rounded-xl p-4 border ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">⏳ Due in next 7 days</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-slate-700"}`}>{dueSoonTasks.length}</span>
              </div>
              {dueSoonTasks.length === 0 ? (
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>No upcoming deadlines.</p>
              ) : (
                <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {dueSoonTasks.map((t) => (
                    <li key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
                      <div className="text-xl leading-none">📆</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium truncate">{t.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                            t.priority === "High"
                              ? "bg-rose-500 text-white"
                              : t.priority === "Medium"
                              ? "bg-amber-500 text-white"
                              : "bg-sky-500 text-white"
                          }`}>{t.priority}</span>
                        </div>
                        <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>
                          Due {new Date(parseLocalDate(t.dueDate)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Overdue */}
            <div className={`${darkMode ? "bg-gray-900/40" : "bg-slate-100"} rounded-xl p-4 border ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">⚠️ Overdue</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-slate-700"}`}>{overdueTasks.length}</span>
              </div>
              {overdueTasks.length === 0 ? (
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>No overdue tasks. Nice!</p>
              ) : (
                <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {overdueTasks.map((t) => (
                    <li key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
                      <div className="text-xl leading-none">⏰</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium truncate">{t.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white whitespace-nowrap">Overdue</span>
                        </div>
                        <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>
                          Was due {new Date(parseLocalDate(t.dueDate)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TASKS */}
      {activeTab === "tasks" && (
        <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">✅ My Individual Tasks</h2>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Tasks assigned only to you
          </p>

          {individualTasks.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No individual tasks available.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {individualTasks.map(task => (
                <TaskItem key={task.id} {...{task, darkMode, editingTaskId, updatedTask, commentInput,
                  openCommentsTaskId, setUpdatedTask, setCommentInput, setEditingTaskId,
                  setOpenCommentsTaskId, handleEdit, handleSave, handleDelete, addComment, user}} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* GROUP TASKS */}
      {activeTab === "groupTasks" && (
        <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">📋 Team Tasks</h2>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Tasks shared with multiple team members
          </p>

          {groupTasks.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No group tasks available.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupTasks.map(task => (
                <GroupTaskItem key={task.id} {...{task, darkMode, editingTaskId, updatedTask, commentInput,
                  openCommentsTaskId, setUpdatedTask, setCommentInput, setEditingTaskId,
                  setOpenCommentsTaskId, handleEdit, handleSave, handleDelete, addComment, user}} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* MY TEAMS */}
      {activeTab === "myTeams" && (
        <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-1">👥 My Teams</h2>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Teams you are a member of
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              darkMode ? "bg-gray-700/50" : "bg-white/80"
            } shadow-sm`}>
              <div className="text-center">
                <p className={`text-xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                  {userTeams.length}
                </p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Teams</p>
              </div>
            </div>
          </div>

          {userTeams.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>You are not a member of any team yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTeams.map(team => (
                <div
                  key={team.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    darkMode 
                      ? "bg-gradient-to-br from-indigo-900/30 to-gray-800/50 border-indigo-700/50 hover:border-indigo-600" 
                      : "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 hover:border-indigo-400"
                  } shadow-md hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {team.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      darkMode ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                    }`}>
                      {team.members.length} members
                    </span>
                  </div>

                  {team.description && (
                    <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {team.description}
                    </p>
                  )}

                  <div className={`pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Team Members:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {team.members.slice(0, 5).map((member, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            member === user?.username
                              ? darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                              : darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {member === user?.username ? `${member} (You)` : member}
                        </span>
                      ))}
                      {team.members.length > 5 && (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
                        }`}>
                          +{team.members.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      </div>
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
    <li className={`relative border-l-4 p-5 rounded-xl shadow-lg transition-all hover:shadow-xl ${
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
            <button className={`${darkMode ? "bg-green-600" : "bg-green-500"} text-white px-4 py-2 rounded-md hover:opacity-90`}
              onClick={()=>handleSave(task.id)}>Save</button>
            <button className={`${darkMode ? "bg-gray-600" : "bg-gray-300"} px-4 py-2 rounded-md hover:opacity-90`}
              onClick={()=>setEditingTaskId(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Priority Corner Badge */}
          <div className="absolute top-0 right-0">
            <div className={`px-3 py-0.5 rounded-bl-xl rounded-tr-xl text-xs font-bold shadow-sm ${
              task.priority === "High"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                : task.priority === "Medium"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
            }`}>
              {task.priority}
            </div>
          </div>

          {/* Header */}
          <div className="mb-3 mt-1">
            <h3 className={`font-bold text-lg mb-2 pr-14 leading-tight ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}>
              {task.title}
            </h3>
            
            {/* Status Badge with Icon */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                task.status === "Done"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                  : task.status === "In Progress"
                  ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                  : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
              }`}>
                {task.status === "Done" && "✓"}
                {task.status === "In Progress" && "⟳"}
                {task.status === "To Do" && "○"}
                {task.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-3 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {task.description || "No description provided"}
          </p>

          {/* Comments */}
          <div className="mb-3">
            <button onClick={()=>setOpenCommentsTaskId(openCommentsTaskId===task.id?null:task.id)}
              className={`${darkMode?"text-blue-400 hover:text-blue-300":"text-blue-600 hover:text-blue-700"} text-sm font-medium transition-colors`}>
              💬 {Array.isArray(task.comments) ? `${task.comments.length} comments` : "Add comment"}
            </button>
          </div>

          {openCommentsTaskId===task.id && (
            <div className={`mb-3 p-3 rounded-lg ${darkMode?"bg-gray-900/50":"bg-slate-100"}`}>
              <div className="flex gap-2">
                <input value={commentInput}
                  onChange={(e)=>setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className={`flex-1 p-2 border rounded ${darkMode?"bg-gray-800 border-gray-700 text-white":"bg-white border-slate-300"}`}
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                  onClick={()=>{ 
                    if(!commentInput.trim())return;
                    const newComment = {
                      id: Date.now(),
                      text: commentInput.trim(),
                      author: user.username,
                      createdAt: new Date().toISOString()
                    };
                    addComment(task.id, newComment); 
                    setCommentInput(""); 
                  }}>
                  Add
                </button>
                <button className={`px-3 py-2 rounded font-medium transition-colors ${darkMode?"bg-gray-700 text-white hover:bg-gray-600":"bg-gray-300 text-black hover:bg-gray-400"}`}
                  onClick={()=>{ setOpenCommentsTaskId(null); setCommentInput(""); }}>Close</button>
              </div>

              <ul className="mt-2 space-y-2">
                {(task.comments||[]).map((c)=>(
                  <li key={c.id} className={`p-2 border rounded text-xs ${darkMode?"border-gray-700 bg-gray-800":"border-slate-200 bg-white"}`}>
                    {c.text}
                    <div className="text-[10px] opacity-70 mt-1">{c.author} • {new Date(c.createdAt).toLocaleString()}</div>
                  </li>
                ))}
                {(!task.comments || task.comments.length===0) && <li className="text-xs opacity-70">No comments yet.</li>}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
              onClick={()=>handleEdit(task)}>
              ✏️ Edit
            </button>
            {user.role==="admin" && (
              <button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                onClick={()=>handleDelete(task.id)}>
                🗑️ Delete
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

/* Group Task Component - Shows assigned team members */
function GroupTaskItem({
  task, darkMode, editingTaskId, updatedTask, commentInput, openCommentsTaskId,
  setUpdatedTask, setCommentInput, setEditingTaskId, setOpenCommentsTaskId,
  handleEdit, handleSave, handleDelete, addComment, user
}) {
  return (
    <li className={`relative border-l-4 p-5 rounded-xl shadow-lg transition-all hover:shadow-xl ${
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
            <button className={`${darkMode ? "bg-green-600" : "bg-green-500"} text-white px-4 py-2 rounded-md hover:opacity-90`}
              onClick={()=>handleSave(task.id)}>Save</button>
            <button className={`${darkMode ? "bg-gray-600" : "bg-gray-300"} px-4 py-2 rounded-md hover:opacity-90`}
              onClick={()=>setEditingTaskId(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Priority Corner Badge */}
          <div className="absolute top-0 right-0">
            <div className={`px-3 py-0.5 rounded-bl-xl rounded-tr-xl text-xs font-bold shadow-sm ${
              task.priority === "High"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                : task.priority === "Medium"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
            }`}>
              {task.priority}
            </div>
          </div>

          {/* Header */}
          <div className="mb-3 mt-1">
            <h3 className={`font-bold text-lg mb-2 pr-14 leading-tight ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}>
              {task.title}
            </h3>
            
            {/* Status Badge with Icon */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                task.status === "Done"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                  : task.status === "In Progress"
                  ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                  : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
              }`}>
                {task.status === "Done" && "✓"}
                {task.status === "In Progress" && "⟳"}
                {task.status === "To Do" && "○"}
                {task.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-3 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {task.description || "No description provided"}
          </p>

          {/* Assigned Team Members */}
          <div className={`mb-3 pb-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <span className={`text-xs font-semibold mb-2 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              👥 Team Members:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(task.assignedTo) && task.assignedTo.map((member, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                    darkMode ? "bg-indigo-600 text-indigo-100" : "bg-indigo-500 text-white"
                  }`}
                >
                  {member}
                </span>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mb-3">
            <button onClick={()=>setOpenCommentsTaskId(openCommentsTaskId===task.id?null:task.id)}
              className={`${darkMode?"text-blue-400 hover:text-blue-300":"text-blue-600 hover:text-blue-700"} text-sm font-medium transition-colors`}>
              💬 {Array.isArray(task.comments) ? `${task.comments.length} comments` : "Add comment"}
            </button>
          </div>

          {openCommentsTaskId===task.id && (
            <div className={`mb-3 p-3 rounded-lg ${darkMode?"bg-gray-900/50":"bg-slate-100"}`}>
              <div className="flex gap-2">
                <input value={commentInput}
                  onChange={(e)=>setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className={`flex-1 p-2 border rounded ${darkMode?"bg-gray-800 border-gray-700 text-white":"bg-white border-slate-300"}`}
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                  onClick={()=>{ 
                    if(!commentInput.trim())return;
                    const newComment = {
                      id: Date.now(),
                      text: commentInput.trim(),
                      author: user.username,
                      createdAt: new Date().toISOString()
                    };
                    addComment(task.id, newComment); 
                    setCommentInput(""); 
                  }}>
                  Add
                </button>
                <button className={`px-3 py-2 rounded font-medium transition-colors ${darkMode?"bg-gray-700 text-white hover:bg-gray-600":"bg-gray-300 text-black hover:bg-gray-400"}`}
                  onClick={()=>{ setOpenCommentsTaskId(null); setCommentInput(""); }}>Close</button>
              </div>

              <ul className="mt-2 space-y-2">
                {(task.comments||[]).map((c)=>(
                  <li key={c.id} className={`p-2 border rounded text-xs ${darkMode?"border-gray-700 bg-gray-800":"border-slate-200 bg-white"}`}>
                    {c.text}
                    <div className="text-[10px] opacity-70 mt-1">{c.author} • {new Date(c.createdAt).toLocaleString()}</div>
                  </li>
                ))}
                {(!task.comments || task.comments.length===0) && <li className="text-xs opacity-70">No comments yet.</li>}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
              onClick={()=>handleEdit(task)}>
              ✏️ Edit
            </button>
            {user.role==="admin" && (
              <button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                onClick={()=>handleDelete(task.id)}>
                🗑️ Delete
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}
