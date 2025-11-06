import React from "react";
import { UserCircle } from "lucide-react";

/**
 * Unified TaskCard component for both Admin and User views
 * Supports inline editing, comments, and customizable actions
 */
function TaskCard({
  task,
  darkMode,
  userRole,
  isEditing = false,
  editForm,
  commentInput,
  showComments = false,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onEditFormChange,
  onToggleComments,
  onCommentChange,
  onAddComment,
  onSelectTask,
  currentUser,
  // Bulk selection
  bulkMode = false,
  selected = false,
  onToggleSelect,
}) {
  // Render edit mode
  if (isEditing) {
    return (
      <div className={`p-5 rounded-xl shadow-lg border ${
        darkMode ? "bg-gray-900/60 border-gray-800/70" : "bg-white border-gray-200"
      }`}>
        <div className="space-y-3">
          <input
            type="text"
            className={`w-full p-2 border rounded-md ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"
            }`}
            value={editForm.title}
            onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
            placeholder="Task title"
          />

          <textarea
            className={`w-full p-2 border rounded-md ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"
            }`}
            value={editForm.description}
            onChange={(e) => onEditFormChange({ ...editForm, description: e.target.value })}
            placeholder="Task description"
            rows="3"
          />

          <select
            className={`w-full p-2 border rounded-md ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"
            }`}
            value={editForm.status}
            onChange={(e) => onEditFormChange({ ...editForm, status: e.target.value })}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <div className="flex gap-2">
            <button
              className={`flex-1 ${
                darkMode ? "bg-green-600" : "bg-green-500"
              } text-white px-4 py-2 rounded-md hover:opacity-90 font-bold`}
              onClick={onSave}
            >
              💾 Save
            </button>
            <button
              className={`flex-1 ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              } px-4 py-2 rounded-md hover:opacity-90 font-bold`}
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render view mode
  return (
    <div
      className={`relative p-4 sm:p-5 rounded-xl shadow-lg border transition-all hover:shadow-xl flex flex-col ${
        task.priority === "High"
          ? darkMode
            ? "border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-900/20 to-gray-800/50"
            : "border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50 to-white"
          : task.priority === "Medium"
          ? darkMode
            ? "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-900/20 to-gray-800/50"
            : "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white"
          : darkMode
          ? "border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-900/20 to-gray-800/50"
          : "border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50 to-white"
      } ${onSelectTask ? "cursor-pointer" : ""}`}
      onClick={() => onSelectTask && onSelectTask(task)}
    >
      {/* Bulk select checkbox */}
      {bulkMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect && onToggleSelect();
          }}
          className={`absolute top-2 left-2 w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
            selected
              ? "bg-blue-600 border-blue-600 text-white"
              : darkMode
              ? "bg-gray-800 border-gray-600 text-gray-300"
              : "bg-white border-gray-300 text-transparent"
          }`}
          aria-label={selected ? "Deselect task" : "Select task"}
        >
          ✓
        </button>
      )}
      {/* Priority Corner Badge */}
      <div className="absolute top-0 right-0">
        <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-bl-xl rounded-tr-xl text-[10px] sm:text-xs font-bold shadow-sm ${
          task.priority === "High"
            ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
            : task.priority === "Medium"
            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
        }`}>
          {task.priority}
        </div>
      </div>

      {/* Title & Status Badge */}
      <div className="mb-3 mt-1">
        <h3 className={`font-bold text-base sm:text-lg mb-2 pr-12 sm:pr-14 leading-tight ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}>
          {task.title}
        </h3>
        
        <span className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm ${
          task.status === "Done"
            ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
            : task.status === "In Progress"
            ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
            : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
        }`}>
          {task.status === "Done" && "✓ "}
          {task.status === "In Progress" && "⟳ "}
          {task.status === "To Do" && "○ "}
          <span className="hidden xs:inline">{task.status}</span>
          <span className="xs:hidden">{task.status === "In Progress" ? "Progress" : task.status}</span>
        </span>
      </div>

      {/* Description */}
      {/* Scroll description if it grows large to keep cards compact */}
      <p className={`text-sm mb-3 leading-relaxed overflow-y-auto pr-1 ${
        darkMode ? "text-gray-300" : "text-gray-600"
      }`} style={{ 
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        maxHeight: '3rem',
        lineHeight: '1.5rem'
      }}>
        {task.description || "No description provided"}
      </p>

      {/* Assigned Users & Due Date */}
      <div className={`space-y-2 mb-3 pb-3 border-t pt-3 ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}>
        {/* Assigned Users */}
        <div className="flex items-start gap-2">
          <UserCircle size={18} className={`mt-0.5 ${
            darkMode ? "text-indigo-400" : "text-indigo-600"
          }`} />
          <div className="flex-1">
            <div className={`text-xs font-semibold mb-1 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              Assigned to:{" "}
              {Array.isArray(task.assignedTo) && task.assignedTo.length > 1 && task.teamName && (
                <span className={darkMode ? "text-indigo-400" : "text-indigo-600"}>
                  {task.teamName}
                </span>
              )}
            </div>
            {Array.isArray(task.assignedTo) ? (
              <div className="flex flex-wrap gap-1.5">
                {task.assignedTo.map((u, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                      darkMode ? "bg-indigo-600 text-indigo-100" : "bg-indigo-500 text-white"
                    }`}
                  >
                    {u}
                  </span>
                ))}
              </div>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm inline-block ${
                darkMode ? "bg-indigo-600 text-indigo-100" : "bg-indigo-500 text-white"
              }`}>
                {task.assignedTo}
              </span>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2">
          <span className="text-lg">📆</span>
          <div className="flex-1">
            <div className={`text-xs font-semibold ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              Due Date:
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No deadline"}
              </span>
              {task.dueDate && task.status !== "Done" && new Date(task.dueDate) < new Date() && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                  ⚠️ OVERDUE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Input/Display */}
      {showComments && onAddComment && (
        <div className={`mb-3 p-3 rounded-lg ${
          darkMode ? "bg-gray-900/50" : "bg-slate-100"
        }`}>
          <div className="flex gap-2 mb-2">
            <input
              value={commentInput}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Write a comment..."
              className={`flex-1 p-2 border rounded ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-slate-300"
              }`}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (!commentInput.trim()) return;
                onAddComment(commentInput.trim());
              }}
            >
              Add
            </button>
            <button
              className={`px-3 py-2 rounded font-medium transition-colors ${
                darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-300 text-black hover:bg-gray-400"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComments();
                onCommentChange("");
              }}
            >
              Close
            </button>
          </div>

          <ul className="space-y-2">
            {(task.comments || []).map((c) => (
              <li
                key={c.id}
                className={`p-2 border rounded text-xs ${
                  darkMode ? "border-gray-700 bg-gray-800" : "border-slate-200 bg-white"
                }`}
              >
                {c.text}
                <div className="text-[10px] opacity-70 mt-1">
                  {c.author} • {new Date(c.createdAt || c.time).toLocaleString()}
                </div>
              </li>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <li className="text-xs opacity-70">No comments yet.</li>
            )}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
  <div className="flex flex-col gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            ✏️ Edit
          </button>
          {(userRole === "admin" || currentUser?.role === "admin") && onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
            >
              🗑️ Delete
            </button>
          )}
        </div>
        {onToggleComments && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComments();
            }}
            className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            💬 Comments {Array.isArray(task.comments) && task.comments.length > 0 ? `(${task.comments.length})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;

