import React from "react";

export default function BulkActionsBar({
  darkMode,
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  onBulkStatus,
  onBulkPriority,
  onBulkDelete,
}) {
  if (totalCount === 0) return null;
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border ${
        darkMode ? "bg-gray-900/50 border-gray-700" : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="text-sm font-medium">
        Selected {selectedCount} / {totalCount}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Select / Clear */}
        <button
          onClick={onSelectAll}
          className={`${
            darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } px-3 py-1.5 rounded-lg text-sm font-semibold`}
        >
          Select all
        </button>
        <button
          onClick={onClear}
          className={`${
            darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } px-3 py-1.5 rounded-lg text-sm font-semibold`}
        >
          Clear
        </button>

        {/* Status */}
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Status:</span>
          {["To Do", "In Progress", "Done"].map((s) => (
            <button
              key={s}
              onClick={() => onBulkStatus && onBulkStatus(s)}
              className={`${
                s === "Done"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : s === "In Progress"
                  ? "bg-violet-500 hover:bg-violet-600 text-white"
                  : darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              } px-3 py-1.5 rounded-lg text-xs font-bold`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Priority */}
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Priority:</span>
          {["Low", "Medium", "High"].map((p) => (
            <button
              key={p}
              onClick={() => onBulkPriority && onBulkPriority(p)}
              className={`${
                p === "High"
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : p === "Medium"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-sky-500 hover:bg-sky-600 text-white"
              } px-3 py-1.5 rounded-lg text-xs font-bold`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Delete */}
        <button
          onClick={onBulkDelete}
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
        >
          Delete selected
        </button>
      </div>
    </div>
  );
}
