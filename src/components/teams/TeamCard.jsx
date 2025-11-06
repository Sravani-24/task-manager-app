import React from "react";
import { Edit2, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";

function TeamCard({ darkMode, team, isAdmin, expandedTasks, teamTasks, onToggleTasks, onAssignTask, onEdit, onDelete }) {
  return (
    <div
      className={`p-5 rounded-xl shadow-md border-l-4 border-l-blue-500 ${
        darkMode ? "bg-gradient-to-br from-blue-900/20 to-gray-900/60" : "bg-gradient-to-br from-blue-50 to-white"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            {team.name}
          </h3>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {team.description || "No description"}
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="mb-3">
        <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Members ({team.members.length}):
        </p>
        <div className="flex flex-wrap gap-1.5">
          {team.members.map((member, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode ? "bg-blue-600 text-blue-100" : "bg-blue-500 text-white"
              }`}
            >
              {member}
            </span>
          ))}
        </div>
      </div>

      {/* Team Tasks Count */}
      <div className={`mb-3 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-100"}`}>
        <button
          onClick={onToggleTasks}
          className={`w-full p-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition-all ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
          } rounded-lg`}
        >
          <p className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            📋 Team Tasks
          </p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            }`}>
              {teamTasks.length}
            </span>
            {expandedTasks ? (
              <ChevronUp size={16} className={darkMode ? "text-gray-400" : "text-gray-600"} />
            ) : (
              <ChevronDown size={16} className={darkMode ? "text-gray-400" : "text-gray-600"} />
            )}
          </div>
        </button>
        
        {expandedTasks && (
          <div className="px-3 pb-3">
            {teamTasks.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                {teamTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`p-2 rounded text-xs ${
                      darkMode ? "bg-gray-900/50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-medium flex-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                        {task.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                        task.status === "Done"
                          ? "bg-green-500 text-white"
                          : task.status === "In Progress"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.priority && (
                      <span className={`text-[10px] ${
                        task.priority === "High"
                          ? "text-red-400"
                          : task.priority === "Medium"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}>
                        {task.priority} Priority
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                No tasks assigned yet
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onAssignTask}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
        >
          <UserPlus size={14} className="inline mr-1" />
          Assign Task
        </button>
        {isAdmin && (
          <>
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TeamCard;
