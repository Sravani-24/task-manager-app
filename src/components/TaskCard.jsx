import React from "react";

const TaskCard = ({ task, onDelete, onEdit }) => (
  <div className="border rounded-lg p-4 bg-white shadow-md flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
    <div className="min-w-0">
      <h3 className="font-bold text-lg">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      <p className="text-xs mt-1 text-gray-400">
        Priority: {task.priority} | Status: {task.status}
      </p>
    </div>
    <div className="flex flex-wrap gap-2 sm:items-center">
      <button onClick={() => onEdit(task)} className="px-3 py-2 sm:py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Edit</button>
      <button onClick={() => onDelete(task.id)} className="px-3 py-2 sm:py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
    </div>
  </div>
);

export default TaskCard;
