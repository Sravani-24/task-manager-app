import React from "react";

export default function CommentsModal({
  darkMode,
  task,
  commentInput,
  onChangeInput,
  onAdd,
  onClose,
}) {
  if (!task) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className={`relative p-6 rounded-lg w-full max-w-md shadow-xl ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
        {/* Close (X) button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className={`absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
            darkMode
              ? "bg-gray-700/70 border-gray-600 text-gray-200 hover:bg-gray-700"
              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-3 pr-8">Comments — {task.title}</h3>

        <div className={`border rounded p-2 max-h-[250px] overflow-y-auto mb-3 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          {task.comments?.length ? (
            task.comments.map((c) => (
              <div key={c.id} className={`border-b pb-2 mb-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <p className={darkMode ? "text-gray-100" : "text-gray-900"}>{c.text}</p>
                <small className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  — {c.author} • {c.time && !isNaN(new Date(c.time).getTime()) ? new Date(c.time).toLocaleString() : new Date().toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No comments yet.</p>
          )}
        </div>

        <div className="flex gap-2 mb-1">
          <input
            type="text"
            placeholder="Add comment..."
            className={`border p-2 rounded flex-1 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
            value={commentInput}
            onChange={(e) => onChangeInput(e.target.value)}
          />
          <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
            Add
          </button>
        </div>

      </div>
    </div>
  );
}
