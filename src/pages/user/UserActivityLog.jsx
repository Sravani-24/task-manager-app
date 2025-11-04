import React from "react";

function UserActivityLog({ darkMode, activityLogs }) {
  return (
    <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">🧾 My Activity Log</h2>

      {activityLogs.length === 0 ? (
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No activity yet.</p>
      ) : (
        <ul className="space-y-3 max-h-[65vh] overflow-y-auto">
          {activityLogs.map((log, i) => (
            <li key={i} className={`border p-3 rounded-lg text-sm ${
                darkMode ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-200"
              }`}>
              <p className="font-medium">{log.message}</p>
              <span className={`text-xs opacity-75`}>
                {log.user} • {new Date(log.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserActivityLog;
