import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user } = useAuth();

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
      return [];
    }
  });

  const [activityLog, setActivityLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("activityLog")) || [];
    } catch {
      return [];
    }
  });

  //Sync tasks & logs
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks || []));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("activityLog", JSON.stringify(activityLog || []));
  }, [activityLog]);

  //Add activity entry
  const addActivity = (message) => {
    if (!user) return;

    const newEntry = {
      id: Date.now(),
      user: user.username,
      role: user.role,
      message,
      timestamp: new Date().toISOString(),
    };

    setActivityLog((prev = []) => [newEntry, ...prev].slice(0, 200));
    window.dispatchEvent(new Event("activityLogUpdated"));
  };

  //Add Task
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

    setTasks((prev = []) => [...prev, newTask]);
    addActivity(`📝 Created task "${task.title}"`);
  };

  //Update Task
  const updateTask = (id, updatedData) => {
    const oldTask = tasks.find((t) => t.id === id);

    setTasks((prev = []) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );

    addActivity(`✏️ Updated task "${oldTask?.title}"`);
  };

  //Delete Task
  const deleteTask = (id) => {
    const task = tasks?.find((t) => t.id === id);
    setTasks((prev = []) => prev.filter((t) => t.id !== id));

    addActivity(`🗑️ Deleted task "${task?.title}"`);
  };

  //Add Comment
  const addComment = (taskId, comment) => {
    const task = tasks.find((t) => t.id === taskId);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), comment] }
          : t
      )
    );

    addActivity(`💬 Added comment on "${task?.title}"`);
  };

  //Update Comment
  const updateComment = (taskId, commentId, newText) => {
    if (!user || !newText) return;

    const task = tasks.find((t) => t.id === taskId);

    setTasks((prev = []) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updated = (t.comments || []).map((c) =>
          c.id === commentId ? { ...c, text: newText } : c
        );
        return { ...t, comments: updated };
      })
    );

    addActivity(`✏️ Updated comment on "${task?.title}"`);
  };

  //Delete Comment
  const deleteComment = (taskId, commentId) => {
    if (!user || user.role !== "admin") return;

    const task = tasks.find((t) => t.id === taskId);

    setTasks((prev = []) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const remain = (t.comments || []).filter((c) => c.id !== commentId);
        return { ...t, comments: remain };
      })
    );

    addActivity(`🗑️ Deleted a comment on "${task?.title}"`);
  };

  //Get Tasks based on user role
  const getUserTasks = () => {
    if (!user) return [];
    if (user.role === "admin") return tasks || [];

    return (tasks || []).filter(
      (t) =>
        t.user?.toLowerCase() === user.username?.toLowerCase() ||
        t.assignedTo?.toLowerCase() === user.username?.toLowerCase()
    );
  };

  const getUserDashboardStats = () => {
    const userTasks = getUserTasks();

    return {
      total: userTasks.length,
      pending: userTasks.filter((t) => t.status === "Pending").length,
      inProgress: userTasks.filter((t) => t.status === "In Progress").length,
      done: userTasks.filter((t) => t.status === "Done").length,
    };
  };

  const getUserActivity = () => {
    if (!user) return [];
    return (activityLog || []).filter((e) => e.user === user.username);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: tasks || [],
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext) || {};
}
