import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import { Users, ChevronDown } from "lucide-react";
import { useTasks } from "../context/TaskContext"; 
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
  const { tasks } = useTasks();
  const { darkMode } = useTheme();

  // Build a list of users from tasks (creators and assignees)
  const allUsers = useMemo(() => {
    const normMap = new Map();
    const push = (name) => {
      if (!name) return;
      const trimmed = String(name).trim();
      if (!trimmed) return;
      const norm = trimmed.toLowerCase();
      if (!normMap.has(norm)) {
        const display = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        normMap.set(norm, display);
      }
    };
    (tasks || []).forEach((t) => {
      push(t.user);
      if (Array.isArray(t.assignedTo)) {
        t.assignedTo.forEach(push);
      } else if (typeof t.assignedTo === "string") {
        push(t.assignedTo);
      }
    });
    const list = Array.from(normMap, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "All Users", label: "All Users" }, ...list];
  }, [tasks]);

  // Individual user filters per chart
  const [statusUser, setStatusUser] = useState("All Users");
  const [priorityUser, setPriorityUser] = useState("All Users");

  const taskMatchesUser = (t, selected) => {
    if (!selected || selected === "All Users") return true;
    const sel = String(selected).trim().toLowerCase();
    const byCreator = t.user && String(t.user).trim().toLowerCase() === sel;
    const byAssignee = Array.isArray(t.assignedTo)
      ? t.assignedTo.some((u) => u && String(u).trim().toLowerCase() === sel)
      : String(t.assignedTo || "").trim().toLowerCase() === sel;
    return byCreator || byAssignee;
  };

  // Compute basic metrics
  const totalTasks = tasks.length;
  const toDoCount = tasks.filter(t => t.status === "To Do").length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const doneCount = tasks.filter(t => t.status === "Done").length;

  // Tasks by status
  // Status chart (filtered by statusUser)
  const statusData = useMemo(() => {
    const filtered = tasks.filter((t) => taskMatchesUser(t, statusUser));
    return ["To Do", "In Progress", "Done"].map((status) => ({
      status,
      count: filtered.filter((t) => t.status === status).length,
    }));
  }, [tasks, statusUser]);

  // Tasks by priority
  // Priority chart (filtered by priorityUser)
  const priorityData = useMemo(() => {
    const filtered = tasks.filter((t) => taskMatchesUser(t, priorityUser));
    return ["High", "Medium", "Low"].map((priority) => ({
      priority,
      count: filtered.filter((t) => t.priority === priority).length,
    }));
  }, [tasks, priorityUser]);

  // Task completion trend
  // (Trend chart removed as requested)

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-600/10 via-blue-500/10 to-purple-600/10 border border-indigo-200/40 dark:border-indigo-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="lg:min-w-[200px]">
            <h1 className={`text-2xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Analytics</h1>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Task breakdowns and insights by user, status, and priority.</p>
          </div>
          {/* Tiles - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex-1">
            <SummaryTile title="Total" value={totalTasks} from="from-blue-500" to="to-indigo-600" />
            <SummaryTile title="To Do" value={toDoCount} from="from-slate-400" to="to-slate-500" />
            <SummaryTile title="In Progress" value={inProgressCount} from="from-violet-500" to="to-purple-600" />
            <SummaryTile title="Done" value={doneCount} from="from-emerald-500" to="to-green-600" />
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      {/* Tiles moved up beside the heading */}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Pie Chart */}
        <div className={`shadow rounded-2xl p-4 border ${darkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>Tasks by Status</h3>
            <UserSelect options={allUsers} value={statusUser} onChange={setStatusUser} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: darkMode ? "#e5e7eb" : "#1f2937" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar Chart */}
        <div className={`shadow rounded-2xl p-4 border ${darkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>Tasks by Priority</h3>
            <UserSelect options={allUsers} value={priorityUser} onChange={setPriorityUser} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="priority" tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937" }} />
              <YAxis tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937" }} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? "#111827" : "#ffffff", borderColor: darkMode ? "#d1d5db" : "#e5e7eb", color: darkMode ? "#e5e7eb" : "#1f2937" }} />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Small reusable components
function UserSelect({ options, value, onChange }) {
  const { darkMode } = useTheme();
  return (
    <div className="relative">
      <Users className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-7 pr-8 py-1.5 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          darkMode 
            ? "bg-gray-800/70 border-gray-700 text-gray-200" 
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
    </div>
  );
}

function SummaryTile({ title, value, from = "from-slate-400", to = "to-slate-600" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow p-4 text-center border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 text-gray-900 dark:text-gray-100">
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${from} ${to}`} />
      <div className="relative">
        <h2 className="text-gray-700 dark:text-gray-300 text-sm">{title}</h2>
        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
