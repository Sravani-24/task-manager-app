import React from "react";
import { ClipboardList } from "lucide-react";

export default function TasksHeader({
  darkMode,
  isAdmin,
  totalVisible,
  onRequestCleanup,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          <ClipboardList className="inline-block mr-2 mb-1" size={28} />
          Tasks
        </h2>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Manage and track your team's tasks and projects
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={onRequestCleanup}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              darkMode ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
            title="Convert tasks with deleted teams to custom tasks"
          >
            🔧 Cleanup
          </button>
        )}
        <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-white/80"} shadow-sm`}>
          <div className="text-center">
            <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{totalVisible}</p>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
