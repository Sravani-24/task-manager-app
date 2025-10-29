import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user } = useAuth();

  // ✅ Load from localStorage safely
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global activity log (single source of truth)
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const saved = localStorage.getItem("activityLog");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ✅ Persist to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("activityLog", JSON.stringify(activityLog));
  }, [activityLog]);

  // ✅ Add new task
  const addTask = (task) => {
    if (!user) return;
    const newTask = {
      ...task,
      id: Date.now(),
      user: user.username,
      createdAt: new Date().toISOString(),
      status: task.status || "Pending",
      comments: Array.isArray(task.comments) ? task.comments : [],
    };
    setTasks((prev) => [...prev, newTask]);
    addActivity(`Created a new task: ${task.title}`);
  };

  // ✅ Update task
  const updateTask = (id, updatedData) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedData } : task))
    );
    addActivity(`Updated task: ${updatedData.title || `ID ${id}`}`);
  };

  // ✅ Delete task
  const deleteTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addActivity(`Deleted task: ${task?.title || id}`);
  };

  // ---------- Comments API ----------
  const addComment = (taskId, text, parentId = null) => {
    if (!user || !text) return;
    const task = tasks.find((t) => t.id === taskId);
    const taskTitle = task?.title || `Task ${taskId}`;
    const newComment = {
      id: Date.now(),
      author: user.username,
      text,
      createdAt: new Date().toISOString(),
      parentId,
    };
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t));
    addActivity(`Commented on task: ${taskTitle}`);
  };

  const updateComment = (taskId, commentId, newText) => {
    if (!user || !newText) return;
    const task = tasks.find((t) => t.id === taskId);
    const taskTitle = task?.title || `Task ${taskId}`;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const updated = (t.comments || []).map((c) => c.id === commentId ? { ...c, text: newText, updatedAt: new Date().toISOString() } : c);
      return { ...t, comments: updated };
    }));
    addActivity(`Updated a comment on task: ${taskTitle}`);
  };

  const deleteComment = (taskId, commentId) => {
    if (!user || user.role !== "admin") return; // only admins can delete
    const task = tasks.find((t) => t.id === taskId);
    const taskTitle = task?.title || `Task ${taskId}`;
    // remove target comment and its threaded replies
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const toRemove = new Set([commentId]);
      const all = t.comments || [];
      let changed = true;
      while (changed) {
        changed = false;
        for (const c of all) {
          if (c.parentId && toRemove.has(c.parentId) && !toRemove.has(c.id)) {
            toRemove.add(c.id);
            changed = true;
          }
        }
      }
      const remaining = all.filter((c) => !toRemove.has(c.id));
      return { ...t, comments: remaining };
    }));
    addActivity(`Deleted a comment on task: ${taskTitle}`);
  };

  // ✅ Add activity (per user)
  const addActivity = (message) => {
    if (!user) return;
    const newEntry = {
      id: Date.now(),
      user: user.username,
      role: user.role,
      message,
      timestamp: new Date().toISOString(),
    };
    setActivityLog((prev) => [newEntry, ...prev].slice(0, 200));
    try {
      const existing = JSON.parse(localStorage.getItem("activityLog")) || [];
      localStorage.setItem("activityLog", JSON.stringify([newEntry, ...existing].slice(0, 200)));
    } catch {}
    // notify listeners (ActivityLogTab listens for this)
    window.dispatchEvent(new Event("activityLogUpdated"));
  };

  // ✅ Get current user's activity logs
  const getUserActivity = () => {
    if (!user) return [];
    return (activityLog || []).filter((e) => e.user === user.username);
  };

  // ✅ Backward compatible alias for older components
  const getActivityLogs = getUserActivity;

  // ✅ Get current user's tasks
  const getUserTasks = () => {
    if (!user) return [];
    if (user.role === "admin") return tasks;
    return tasks.filter(
      (t) =>
        t.user?.toLowerCase() === user.username?.toLowerCase() ||
        t.assignedTo?.toLowerCase() === user.username?.toLowerCase()
    );
  };

  // ✅ Dashboard stats (used for user/admin chart)
  const getUserDashboardStats = () => {
    const userTasks = getUserTasks();
    return {
      total: userTasks.length,
      pending: userTasks.filter((t) => t.status === "Pending").length,
      inProgress: userTasks.filter((t) => t.status === "In Progress").length,
      done: userTasks.filter((t) => t.status === "Done").length,
    };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        addComment,
        updateComment,
        deleteComment,
        getUserTasks,
        getUserDashboardStats,
        addActivity,
        getUserActivity,
        getActivityLogs: getUserActivity,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
