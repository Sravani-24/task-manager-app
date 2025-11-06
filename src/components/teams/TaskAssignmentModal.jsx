import React from "react";
import { X } from "lucide-react";

function TaskAssignmentModal({ darkMode, selectedTeam, taskForm, setTaskForm, today, onSubmit, onClose }) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className={`p-6 rounded-lg w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            Assign Task to "{selectedTeam.name}"
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Task Title"
            required
            className={`w-full border p-2 rounded ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <textarea
            placeholder="Task Description"
            rows="3"
            className={`w-full border p-2 rounded ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />

          <select
            className={`w-full border p-2 rounded ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <select
            className={`w-full border p-2 rounded ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <input
            type="date"
            min={today}
            className={`w-full border p-2 rounded ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />

          <div className={`p-3 rounded ${darkMode ? "bg-gray-700/50" : "bg-blue-50"}`}>
            <p className="text-sm font-semibold mb-1">Task will be assigned to:</p>
            <div className="flex flex-wrap gap-1">
              {selectedTeam.members.map((member, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${
                    darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                  }`}
                >
                  {member}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Assign Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md border ${
                darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskAssignmentModal;
