import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import { useTheme } from "../../context/ThemeContext";
import { LayoutDashboard, CheckSquare, Users, Activity, Menu } from "lucide-react";
import UserDashboard from "./UserDashboard";
import UserIndividualTasks from "./UserIndividualTasks";
import UserGroupTasks from "./UserGroupTasks";
import UserMyTeams from "./UserMyTeams";
import UserActivityLog from "./UserActivityLog";
import CommentsModal from "../../components/tasks/CommentsModal";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import StatusEditModal from "../../components/tasks/StatusEditModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function UserPage() {
  const { user } = useAuth();
  const { getUserTasks, updateTask, deleteTask, getUserActivity, addComment } = useTasks();
  const { darkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({ title: "", description: "", status: "" });
  const [commentModalTask, setCommentModalTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [userTeams, setUserTeams] = useState([]);
  const [statusEditTask, setStatusEditTask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const userTasksAll = getUserTasks();
  const userTasks = (userTasksAll || []).filter((t) => {
    if (!t) return false;
    const me = user?.username?.toLowerCase();
    if (!me) return false;
    if (Array.isArray(t.assignedTo)) {
      return t.assignedTo.some((assignee) => assignee?.toLowerCase() === me);
    }
    return t.assignedTo?.toLowerCase() === me;
  });
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

  // --- Parse Local Date (used by child components) ---
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

  const handleEdit = (task) => {
    setStatusEditTask(task);
  };

  const handleSave = (id) => {
    updateTask(id, updatedTask);
    setEditingTaskId(null);
  };

  const handleStatusSave = (newStatus) => {
    if (statusEditTask) {
      updateTask(statusEditTask.id, { status: newStatus });
    }
  };

  const handleDelete = (id) => {
    if (user.role === "admin") {
      setConfirmDialog({
        message: "Delete this task? This cannot be undone.",
        onConfirm: () => {
          deleteTask(id);
          setConfirmDialog(null);
        },
        onCancel: () => setConfirmDialog(null),
      });
    } else {
      alert("Only admins can delete tasks.");
    }
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    // Moved "My Teams" above "My Tasks"
    { key: "myTeams", label: "My Teams", icon: <Users size={18} /> },
    { key: "tasks", label: "My Tasks", icon: <CheckSquare size={18} /> },
    { key: "groupTasks", label: "Team Tasks", icon: <Users size={18} /> },
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
        className={`flex-1 flex flex-col transition-all duration-300 overflow-hidden ${
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
              {activeTab === "groupTasks" && "Team Tasks"}
              {activeTab === "activity" && "Activity Log"}
            </h1>
          </div>
          <div></div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8 lg:p-10">
          <div className="pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">
              👋 Welcome, {user?.username || "User"}!
            </h1>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <UserDashboard 
          darkMode={darkMode}
          userTasks={userTasks}
          parseLocalDate={parseLocalDate}
        />
      )}

      {/* TASKS */}
      {activeTab === "tasks" && (
        <UserIndividualTasks 
          darkMode={darkMode}
          individualTasks={individualTasks}
          editingTaskId={editingTaskId}
          updatedTask={updatedTask}
          setUpdatedTask={setUpdatedTask}
          setEditingTaskId={setEditingTaskId}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleDelete={handleDelete}
          onOpenComments={(task) => setCommentModalTask(task)}
          onSelectTask={(task) => setSelectedTask(task)}
          user={user}
        />
      )}

      {/* GROUP TASKS */}
      {activeTab === "groupTasks" && (
        <UserGroupTasks 
          darkMode={darkMode}
          groupTasks={groupTasks}
          editingTaskId={editingTaskId}
          updatedTask={updatedTask}
          setUpdatedTask={setUpdatedTask}
          setEditingTaskId={setEditingTaskId}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleDelete={handleDelete}
          onOpenComments={(task) => setCommentModalTask(task)}
          onSelectTask={(task) => setSelectedTask(task)}
          user={user}
        />
      )}

      {/* MY TEAMS */}
      {activeTab === "myTeams" && (
        <UserMyTeams 
          darkMode={darkMode}
          userTeams={userTeams}
          user={user}
        />
      )}

      {/* ACTIVITY */}
      {activeTab === "activity" && (
        <UserActivityLog 
          darkMode={darkMode}
          activityLogs={activityLogs}
        />
      )}
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {commentModalTask && (
        <CommentsModal
          darkMode={darkMode}
          task={commentModalTask}
          commentInput={commentInput}
          onChangeInput={setCommentInput}
          onAdd={() => {
            if (!commentInput.trim()) return;
            const newComment = { 
              id: Date.now(), 
              text: commentInput.trim(), 
              author: user.username, 
              time: new Date().toISOString() 
            };
            addComment(commentModalTask.id, newComment);
            setCommentInput("");
            setCommentModalTask((prev) => ({ 
              ...prev, 
              comments: [...(prev.comments || []), newComment] 
            }));
          }}
          onClose={() => {
            setCommentModalTask(null);
            setCommentInput("");
          }}
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal 
          darkMode={darkMode} 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {/* Status Edit Modal */}
      {statusEditTask && (
        <StatusEditModal
          darkMode={darkMode}
          task={statusEditTask}
          onClose={() => setStatusEditTask(null)}
          onSave={handleStatusSave}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          darkMode={darkMode}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
}
