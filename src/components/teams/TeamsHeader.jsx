import React from "react";
import { Users, Plus } from "lucide-react";

function TeamsHeader({ darkMode, teamsCount, isAdmin, onCreateTeam }) {
  return (
    <div className={`mb-6 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${
      darkMode 
        ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
        : "from-blue-50 via-white to-purple-50 border border-blue-100"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            <Users className="inline-block mr-2 mb-1" size={28} />
            Teams
          </h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Create and manage teams to collaborate on tasks
          </p>
        </div>
        <div className={`p-4 rounded-xl ${
          darkMode ? "bg-gray-700/50" : "bg-white/80"
        } shadow-sm`}>
          <div className="text-center">
            <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              {teamsCount}
            </p>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Teams</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={onCreateTeam}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Team
        </button>
      )}
    </div>
  );
}

export default TeamsHeader;
