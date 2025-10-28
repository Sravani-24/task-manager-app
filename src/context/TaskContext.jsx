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

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("activityLogs");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ✅ Persist to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  // ✅ Add new task
  const addTask = (task) => {
    if (!user) return;
    const newTask = {
      ...task,
      id: Date.now(),
      user: user.username,
      createdAt: new Date().toISOString(),
      status: "Pending",
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

  // ✅ Add activity (per user)
  const addActivity = (message) => {
    if (!user) return;
    const username = user.username;
    const newEntry = {
      message,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => {
      const userLogs = prev[username] || [];
      return {
        ...prev,
        [username]: [newEntry, ...userLogs.slice(0, 49)], // keep last 50
      };
    });
  };

  // ✅ Get current user's activity logs
  const getUserActivity = () => {
    if (!user) return [];
    return activityLogs[user.username] || [];
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
        getUserTasks,
        getUserDashboardStats,
        addActivity,
        getUserActivity,
        getActivityLogs, // alias for compatibility
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
