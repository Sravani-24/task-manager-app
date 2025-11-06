import React from "react";

export default function TaskDetailsModal({ darkMode, task, onClose }) {
  if (!task) return null;
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-start justify-between mb-4 pb-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex-1 pr-4">
            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{task.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                task.status === "Done"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                  : task.status === "In Progress"
                  ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                  : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
              }`}>
                {task.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                task.priority === "High"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : task.priority === "Medium"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              }`}>
                {task.priority} Priority
              </span>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`} aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-220px)] pr-2">
          <div className="mb-6">
            <h4 className={`font-semibold mb-2 text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Description:</h4>
            <div className={`border rounded-xl p-4 text-sm max-h-[300px] overflow-y-auto whitespace-pre-wrap ${
              darkMode ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
            }`}>
              {task.description || "No description provided"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className={`font-semibold mb-2 text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Assigned To:{" "}
                {Array.isArray(task.assignedTo) && task.assignedTo.length > 1 && task.teamName && (
                  <span className={`normal-case ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>{task.teamName}</span>
                )}
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(task.assignedTo) ? (
                  task.assignedTo.map((u, idx) => (
                    <span key={idx} className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${darkMode ? "bg-indigo-600 text-indigo-100" : "bg-indigo-500 text-white"}`}>{u}</span>
                  ))
                ) : (
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{task.assignedTo}</span>
                )}
              </div>
            </div>

            <div>
              <h4 className={`font-semibold mb-2 text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Due Date:</h4>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                  : "No deadline set"}
              </p>
            </div>
          </div>

          {task.comments && task.comments.length > 0 && (
            <div>
              <h4 className={`font-semibold mb-3 text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Comments ({task.comments.length}):
              </h4>
              <div className="space-y-2">
                {task.comments.map((comment) => (
                  <div key={comment.id} className={`p-3 rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{comment.text}</p>
                    <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {comment.author} • {new Date(comment.time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <button onClick={onClose} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
