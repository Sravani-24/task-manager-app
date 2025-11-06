import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import { Users, ChevronDown } from "lucide-react";
import { useTasks } from "../../context/TaskContext"; 
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
  const { tasks } = useTasks();
  const { darkMode } = useTheme();

  // Fetch users from Firestore
  const [firestoreUsers, setFirestoreUsers] = useState([]);
  const [userRefreshKey, setUserRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const usersList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFirestoreUsers(usersList);
    };
    fetchUsers();
  }, [userRefreshKey]);

  // Refresh users list periodically or when tasks change
  useEffect(() => {
    const interval = setInterval(() => {
      setUserRefreshKey(prev => prev + 1);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Build user list directly from Firestore users (excluding admins and deleted users)
  const allUsers = useMemo(() => {
    // Get valid users from Firestore (excluding admins)
    const validUsers = firestoreUsers
      .filter(u => {
        const role = u.role?.toLowerCase();
        const username = u.username?.trim();
        // Exclude admins, deleted users, and users without valid usernames
        return role !== "admin" && username && username !== "" && username.toLowerCase() !== "deleted user";
      })
      .map(u => ({
        value: u.username.toLowerCase(),
        label: u.username.charAt(0).toUpperCase() + u.username.slice(1)
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    return [{ value: "All Users", label: "All Users" }, ...validUsers];
  }, [firestoreUsers]);

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
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = (t) => !!t.dueDate && t.status !== "Done" && t.dueDate < todayStr;

  // Partition counts so overdue is its own bucket (not double-counted in other states)
  const doneCount = tasks.filter(t => t.status === "Done").length;
  const overdueCount = tasks.filter(isOverdue).length;
  const toDoOnTime = tasks.filter(t => t.status === "To Do" && !isOverdue(t)).length;
  const inProgressOnTime = tasks.filter(t => t.status === "In Progress" && !isOverdue(t)).length;

  // Tasks by status (with Overdue as a separate category to avoid double counting)
  // Status chart (filtered by statusUser)
  const statusData = useMemo(() => {
    const filtered = (tasks || []).filter((t) => taskMatchesUser(t, statusUser));
    const todayStr = new Date().toISOString().split("T")[0];

    const isOverdue = (t) => !!t.dueDate && t.status !== "Done" && t.dueDate < todayStr;

    const done = filtered.filter((t) => t.status === "Done").length;
    const overdue = filtered.filter(isOverdue).length;
    const todoOnTime = filtered.filter((t) => t.status === "To Do" && !isOverdue(t)).length;
    const inProgressOnTime = filtered.filter((t) => t.status === "In Progress" && !isOverdue(t)).length;

    return [
      { status: "To Do", count: todoOnTime },
      { status: "In Progress", count: inProgressOnTime },
      { status: "Done", count: done },
      { status: "Overdue", count: overdue },
    ];
  }, [tasks, statusUser]);

  const hasStatusData = useMemo(() => {
    return statusData.some(item => item.count > 0);
  }, [statusData]);

  // Tasks by priority
  // Priority chart (filtered by priorityUser)
  const priorityData = useMemo(() => {
    const filtered = tasks.filter((t) => taskMatchesUser(t, priorityUser));
    return ["High", "Medium", "Low"].map((priority) => ({
      priority,
      count: filtered.filter((t) => t.priority === priority).length,
    }));
  }, [tasks, priorityUser]);

  const hasPriorityData = useMemo(() => {
    return priorityData.some(item => item.count > 0);
  }, [priorityData]);

  // Task completion trend
  // (Trend chart removed as requested)

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className={`p-4 sm:p-5 rounded-2xl shadow-lg bg-gradient-to-br ${
        darkMode 
          ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
          : "from-blue-100/50 via-indigo-50/30 to-purple-100/50 border border-blue-200/50"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="lg:min-w-[200px]">
            <h1 className={`text-2xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Analytics</h1>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Task breakdowns and insights by user, status, and priority.</p>
          </div>
          {/* Tiles - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:flex-1">
            <SummaryTile title="Total" value={totalTasks} from="from-blue-500" to="to-indigo-600" />
            <SummaryTile title="To Do" value={toDoOnTime} from="from-slate-400" to="to-slate-500" />
            <SummaryTile title="In Progress" value={inProgressOnTime} from="from-violet-500" to="to-purple-600" />
            <SummaryTile title="Done" value={doneCount} from="from-emerald-500" to="to-green-600" />
            <SummaryTile title="Overdue" value={overdueCount} from="from-rose-500" to="to-red-600" />
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      {/* Tiles moved up beside the heading */}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-16">
        {/* Status Pie Chart */}
        <div className={`shadow rounded-2xl p-3 sm:p-4 border ${darkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <h3 className={`font-semibold text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-900"}`}>Tasks by Status</h3>
            <UserSelect options={allUsers} value={statusUser} onChange={setStatusUser} />
          </div>
          {hasStatusData ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: darkMode ? "#e5e7eb" : "#1f2937", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl mb-3`}>📊</div>
                <p className={`text-base sm:text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  No tasks found
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {statusUser === "All Users" 
                    ? "No tasks have been created yet" 
                    : `No tasks assigned to ${statusUser}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Priority Bar Chart */}
        <div className={`shadow rounded-2xl p-3 sm:p-4 border ${darkMode ? "bg-gray-900/60 border-gray-800/60" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <h3 className={`font-semibold text-sm sm:text-base ${darkMode ? "text-gray-200" : "text-gray-900"}`}>Tasks by Priority</h3>
            <UserSelect options={allUsers} value={priorityUser} onChange={setPriorityUser} />
          </div>
          {hasPriorityData ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <XAxis dataKey="priority" tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937" }} style={{ fontSize: "12px" }} />
                <YAxis tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937" }} style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#111827" : "#ffffff", borderColor: darkMode ? "#d1d5db" : "#e5e7eb", color: darkMode ? "#e5e7eb" : "#1f2937", fontSize: "12px" }} />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-center">
                <div className={`text-4xl sm:text-5xl mb-3`}>📊</div>
                <p className={`text-base sm:text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  No tasks found
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {priorityUser === "All Users" 
                    ? "No tasks have been created yet" 
                    : `No tasks assigned to ${priorityUser}`}
                </p>
              </div>
            </div>
          )}
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
        size="1"
        className={`appearance-none pl-7 pr-8 py-1.5 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          darkMode 
            ? "bg-gray-800/70 border-gray-700 text-gray-200" 
            : "bg-white border-gray-300 text-gray-900"
        }`}
        style={{
          maxHeight: '200px',
          overflowY: 'auto'
        }}
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
