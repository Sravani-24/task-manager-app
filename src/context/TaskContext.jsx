import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user } = useAuth();

  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("tasks");
      return JSON.parse(stored) || [];
    } catch (error) {
      console.error("Error loading tasks:", error);
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
  const addActivity = (message, options = {}) => {
    if (!user) return;

    const newEntry = {
      id: Date.now(),
      user: options.actor === "system" ? "System" : user.username,
      role: user.role,
      message,
      timestamp: new Date().toISOString(),
    };

    setActivityLog((prev = []) => [newEntry, ...prev].slice(0, 200));
    window.dispatchEvent(new Event("activityLogUpdated"));
  };

  // Permanently clear activity log (state + storage)
  const clearActivity = () => {
    try {
      setActivityLog([]);
      localStorage.removeItem("activityLog");
      window.dispatchEvent(new Event("activityLogUpdated"));
    } catch (e) {
      console.error("Failed to clear activity log:", e);
    }
  };

  //Add Task
  const addTask = (task, options = {}) => {
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
    if (!options.silent) addActivity(`📝 Created task "${task.title}"`, options);
  };

  //Update Task
  const updateTask = (id, updatedData, options = {}) => {
    const oldTask = tasks.find((t) => t.id === id);

    setTasks((prev = []) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );

    if (!options.silent) addActivity(`✏️ Updated task "${oldTask?.title}"`, options);
  };

  //Delete Task
  const deleteTask = (id, options = {}) => {
    const task = tasks?.find((t) => t.id === id);
    setTasks((prev = []) => prev.filter((t) => t.id !== id));

    if (!options.silent) addActivity(`🗑️ Deleted task "${task?.title}"`, options);
  };

  //Add Comment
  const addComment = (taskId, comment, options = {}) => {
    const task = tasks.find((t) => t.id === taskId);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), comment] }
          : t
      )
    );

    if (!options.silent) addActivity(`💬 Added comment on "${task?.title}"`, options);
  };

  //Update Comment
  const updateComment = (taskId, commentId, newText, options = {}) => {
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

    if (!options.silent) addActivity(`✏️ Updated comment on "${task?.title}"`, options);
  };

  //Delete Comment
  const deleteComment = (taskId, commentId, options = {}) => {
    if (!user || user.role !== "admin") return;

    const task = tasks.find((t) => t.id === taskId);

    setTasks((prev = []) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const remain = (t.comments || []).filter((c) => c.id !== commentId);
        return { ...t, comments: remain };
      })
    );

    if (!options.silent) addActivity(`🗑️ Deleted a comment on "${task?.title}"`, options);
  };

  //Get Tasks based on user role
  const getUserTasks = () => {
    if (!user) return [];
    if (user.role === "admin") return tasks || [];

    return (tasks || []).filter((t) => {
      // Check if user created the task
      if (t.user?.toLowerCase() === user.username?.toLowerCase()) return true;
      
      // Check if user is assigned to the task (handle both array and string)
      if (Array.isArray(t.assignedTo)) {
        return t.assignedTo.some(
          (assignee) => assignee?.toLowerCase() === user.username?.toLowerCase()
        );
      }
      return t.assignedTo?.toLowerCase() === user.username?.toLowerCase();
    });
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
        clearActivity,
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
