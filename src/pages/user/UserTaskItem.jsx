import React from "react";
import TaskCard from "../../components/tasks/TaskCard";

function TaskItem({
  task,
  darkMode,
  currentUser,
  isEditing,
  editForm,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onEditFormChange,
  onToggleComments,
  onSelectTask,
}) {
  return (
    <li className="h-full">
      <TaskCard
        task={task}
        darkMode={darkMode}
        currentUser={currentUser}
        isEditing={isEditing}
        editForm={editForm}
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        onCancelEdit={onCancelEdit}
        onEditFormChange={onEditFormChange}
        onToggleComments={onToggleComments}
        onSelectTask={onSelectTask}
      />
    </li>
  );
}

export default TaskItem;
