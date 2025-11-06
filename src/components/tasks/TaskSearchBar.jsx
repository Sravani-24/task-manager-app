import React from "react";
import { Search, Plus } from "lucide-react";

export default function TaskSearchBar({
  darkMode,
  searchQuery,
  onSearchChange,
  isAdmin,
  onCreateNew,
  extraRight = null,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end mb-3">
      <div className="flex-1 relative">
        <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-70">
          Search Tasks
        </label>
        <Search className={`absolute left-3 bottom-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} size={18} />
        <input
          type="text"
          placeholder="Search by task name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl font-medium shadow-sm transition-all border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            darkMode
              ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600 placeholder-gray-400"
              : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100 placeholder-gray-500"
          }`}
        />
      </div>
      <div className="flex items-center gap-2 self-end md:self-auto">
        {isAdmin && (
          <button
            onClick={onCreateNew}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            New Task
          </button>
        )}
        {extraRight}
      </div>
    </div>
  );
}
