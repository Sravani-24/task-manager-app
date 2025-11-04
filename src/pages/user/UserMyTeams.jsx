import React from "react";

function UserMyTeams({ darkMode, userTeams, user }) {
  return (
    <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">👥 My Teams</h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Teams you are a member of
          </p>
        </div>
        <div className={`p-3 rounded-xl ${
          darkMode ? "bg-gray-700/50" : "bg-white/80"
        } shadow-sm`}>
          <div className="text-center">
            <p className={`text-xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              {userTeams.length}
            </p>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Teams</p>
          </div>
        </div>
      </div>

      {userTeams.length === 0 ? (
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>You are not a member of any team yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userTeams.map(team => (
            <div
              key={team.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                darkMode 
                  ? "bg-gradient-to-br from-indigo-900/30 to-gray-800/50 border-indigo-700/50 hover:border-indigo-600" 
                  : "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 hover:border-indigo-400"
              } shadow-md hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-bold text-lg ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {team.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  darkMode ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                }`}>
                  {team.members.length} members
                </span>
              </div>

              {team.description && (
                <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {team.description}
                </p>
              )}

              <div className={`pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Team Members:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {team.members.slice(0, 5).map((member, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        member === user?.username
                          ? darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                          : darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {member === user?.username ? `${member} (You)` : member}
                    </span>
                  ))}
                  {team.members.length > 5 && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                      darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
                    }`}>
                      +{team.members.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserMyTeams;
