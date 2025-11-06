import React from "react";
import TaskCard from "./TaskCard";

export default function TaskList({
  darkMode,
  tasks,
  userRole,
  onEdit,
  onDelete,
  onOpenComments,
  onSelectTask,
  // Bulk selection props (optional)
  bulkMode = false,
  selectedIds,
  onToggleSelect,
}) {
  if (!tasks?.length) {
    return (
      <div className="col-span-full text-center py-16">
        <div className={`inline-block p-8 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <p className="text-6xl mb-4">📋</p>
          <p className="text-xl font-semibold mb-2">No tasks available</p>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {userRole === "admin" ? "Create a new task to get started!" : "No tasks assigned to you yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          darkMode={darkMode}
          userRole={userRole}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectTask={onSelectTask}
          onToggleComments={onOpenComments ? () => onOpenComments(task) : undefined}
          bulkMode={!!bulkMode}
          selected={selectedIds ? selectedIds.has(task.id) : false}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(task.id) : undefined}
        />
      ))}
    </>
  );
}
