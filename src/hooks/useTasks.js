import { useState } from "react";

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    const parsed = saved ? JSON.parse(saved) : [];

    return parsed.map(task => ({
      ...task,
      description: task.description || "",
      comments: task.comments || []
    }));
  });

  const saveTasks = (updated) => {
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const addTask = (task) => {
    const newTask = {
      ...task,
      description: task.description || "",
      comments: []
    };
    saveTasks([...tasks, newTask]);
  };

  const updateTask = (id, data) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, ...data } : t
    );
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const addComment = (taskId, text, parentId = null) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newComment = {
          id: Date.now(),
          text,
          author: localStorage.getItem("currentUser") || "User",
          createdAt: new Date().toISOString(),
          parentId
        };
        return { ...t, comments: [...t.comments, newComment] };
      }
      return t;
    });
    saveTasks(updated);
  };

  const updateComment = (taskId, commentId, newText) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: t.comments.map(c =>
            c.id === commentId ? { ...c, text: newText } : c
          )
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteComment = (taskId, commentId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: t.comments.filter(c => c.id !== commentId)
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    updateComment,
    deleteComment
  };
}
