import React from "react";

function StatusEditModal({ darkMode, task, onClose, onSave }) {
  const [status, setStatus] = React.useState(task?.status || "To Do");

  const handleSave = () => {
    onSave(status);
    onClose();
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl p-4 sm:p-6 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Update Task Status</h2>
        
        <div className="mb-4">
          <p className={`text-xs sm:text-sm font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Task: {task.title}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-3">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className={`flex-1 font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 text-sm sm:text-base ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusEditModal;
