import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Activity } from "lucide-react";

function ActivityLogTab({ darkMode }) {
  const { user } = useAuth();
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("activityLog")) || [];
        // Ensure all logs are in the unified format with user/role/message
        const normalized = saved.map((log) => ({
          id: log.id || Date.now(),
          user: log.user || "System",
          role: log.role || "unknown",
          message: log.message || log.action || "Activity logged",
          
          timestamp: log.timestamp || new Date().toISOString(),
        }));
        
        // Filter logs to show only the current user's activities
        const userLogs = normalized.filter(log => 
          log.user?.toLowerCase() === user?.username?.toLowerCase()
        );
        
        setActivityLog(userLogs);
      } catch (e) {
        console.error("Error loading activity logs:", e);
        setActivityLog([]);
      }
    };

    loadLogs();

    window.addEventListener("activityLogUpdated", loadLogs);
    window.addEventListener("storage", loadLogs);

    return () => {
      window.removeEventListener("activityLogUpdated", loadLogs);
      window.removeEventListener("storage", loadLogs);
    };
  }, [user]);


  return (
    <>
      {/* Header Section with Stats */}
      <div className={`mb-6 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${
        darkMode 
          ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
          : "from-blue-50 via-white to-purple-50 border border-blue-100"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              <Activity className="inline-block mr-2 mb-1" size={28} />
              Activity Log
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Track your recent activities and actions
            </p>
          </div>
          <div className={`p-4 rounded-xl ${
            darkMode ? "bg-gray-700/50" : "bg-white/80"
          } shadow-sm`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {activityLog.length}
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Activities</p>
            </div>
          </div>
        </div>
      </div>

      {activityLog.length > 0 ? (
        <ul className="space-y-3 pb-16">

          {activityLog.map((log) => (
            <li
              key={log.id || log.timestamp}
              className={`p-4 rounded-xl border-l-4 shadow-md transition-all hover:shadow-lg ${
                darkMode ? "border-l-blue-500 bg-gray-800 hover:bg-gray-750" : "border-l-blue-500 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold break-words">{log.message || log.action || "Activity"}</div>
              <div className={`text-sm mt-1 break-words ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {log.user ? `${log.user}${log.role ? ` (${log.role})` : ""} • ` : ""}{new Date(log.timestamp || Date.now()).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`text-center py-16 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <p className="text-6xl mb-4">📋</p>
          <p className="text-xl font-semibold mb-2">No activity yet</p>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Activities will appear here as they happen
          </p>
        </div>
      )}
    </>
  );
}
export default ActivityLogTab;