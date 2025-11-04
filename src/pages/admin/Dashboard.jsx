import React, { useState } from "react";
import {
  Users,
  ClipboardList,
  BarChart2,
  Menu,
  MessageSquare,
  UsersRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTasks } from "../../context/TaskContext";
import UsersTab from "./Users";
import TasksTab from "./Tasks";
import AnalyticsTab from "./Analytics";
import ActivityLogTab from "./ActivityLog";
import TeamsTab from "./Teams";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { addActivity } = useTasks();

  const addActivityLog = (message) => {
    if (!user) return;
    const existingLogs = JSON.parse(localStorage.getItem("activityLog")) || [];
    const newLog = {
      id: Date.now(),
      user: user.username,
      role: user.role,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...existingLogs].slice(0, 200);
    localStorage.setItem("activityLog", JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event("activityLogUpdated"));
    addActivity(message);
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const menuItems = isAdmin
    ? [
        { key: "users", label: "Users", icon: <Users size={18} /> },
        { key: "teams", label: "Teams", icon: <UsersRound size={18} /> },
        { key: "tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
        { key: "activity", label: "Activity Log", icon: <MessageSquare size={18} /> },
        {/* key: "settings", label: "Settings", icon: <Settings size={18} /> */},
      ]
    : [
        { key: "tasks", label: "My Tasks", icon: <ClipboardList size={18} /> },
        { key: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
        {/* key: "settings", label: "Settings", icon: <Settings size={18} /> */},
      ];

  return (
    <div
      className={`flex h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-10"
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <div
        className={`fixed top-0 left-0 h-screen z-20 transition-transform transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${
          darkMode
            ? "bg-gray-900 border-r border-gray-800"
            : "bg-gradient-to-b from-sky-50 to-indigo-50 border-r border-slate-200"
        } w-[80vw] sm:w-64 shadow-lg`}
      >
        <div
          className={`p-5 border-b flex items-center justify-between ${
            darkMode ? "border-gray-800" : "border-slate-200"
          }`}
        >
          <h2 className="text-xl font-semibold tracking-tight">TeamTrack</h2>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)]">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg font-medium transition-all
              ${
                activeTab === item.key
                  ? darkMode
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-sky-200 text-sky-900 shadow-sm"
                  : darkMode
                  ? "hover:bg-gray-800 hover:text-white"
                  : "hover:bg-sky-100 text-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {/* Topbar */}
<header
  className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 
  ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white/80 backdrop-blur border-slate-200"}`}
>  <div className="flex items-center gap-3">
      <button
      onClick={() => setSidebarOpen((prev) => !prev)}
      className="text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Menu size={22} />
    </button>
    <h1 className="text-xl font-semibold capitalize">{activeTab === 'activity' ? 'Activity Log' : activeTab}</h1>
  </div>
  <div></div>
</header>
        {/* Tabs */}
        <main className={`p-4 sm:p-6 pb-8 flex-1 overflow-y-auto`}>
          {activeTab === "users" && <UsersTab darkMode={darkMode} addActivityLog={addActivityLog} />}
          {activeTab === "teams" && <TeamsTab darkMode={darkMode} />}
          {activeTab === "tasks" && <TasksTab darkMode={darkMode} addActivityLog={addActivityLog} />}
          {activeTab === "analytics" && <AnalyticsTab darkMode={darkMode} />}
          {activeTab === "activity" && <ActivityLogTab darkMode={darkMode} />}
          {/* {activeTab === "settings" && <SettingsTab darkMode={darkMode} addActivityLog={addActivityLog} />} */}
        </main>
      </div>
    </div>
  );
}



