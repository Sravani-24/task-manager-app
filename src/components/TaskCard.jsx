import React from "react";

const TaskCard = ({ task, onDelete, onEdit }) => (
  <div className="border rounded-lg p-4 bg-white shadow-md flex justify-between">
    <div>
      <h3 className="font-bold text-lg">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      <p className="text-xs mt-1 text-gray-400">
        Priority: {task.priority} | Status: {task.status}
      </p>
    </div>
    <div className="space-x-2">
      <button onClick={() => onEdit(task)} className="text-blue-600">Edit</button>
      <button onClick={() => onDelete(task.id)} className="text-red-600">Delete</button>
    </div>
  </div>
);

export default TaskCard;
