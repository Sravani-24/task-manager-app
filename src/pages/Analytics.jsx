import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, ResponsiveContainer
} from "recharts";
import { useTasks } from "../context/TaskContext"; 

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
  const { tasks } = useTasks();

  // Compute basic metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const overdueTasks = tasks.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done"
  ).length;

  // Tasks by status
  const statusData = ["To Do", "In Progress", "Done"].map(status => ({
    status,
    count: tasks.filter(t => t.status === status).length
  }));

  // Tasks by priority
  const priorityData = ["High", "Medium", "Low"].map(priority => ({
    priority,
    count: tasks.filter(t => t.priority === priority).length
  }));

  // Task completion trend
  const completionTrend = tasks
    .filter(t => t.status === "Done" && t.completedAt)
    .reduce((acc, t) => {
      const date = new Date(t.completedAt).toLocaleDateString();
      const found = acc.find(item => item.date === date);
      if (found) found.count += 1;
      else acc.push({ date, count: 1 });
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
      <p className="text-gray-600">
        Task completion metrics, activity trends, and user analytics.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 text-center">
          <h2 className="text-gray-500 dark:text-gray-300">Total Tasks</h2>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 text-center">
          <h2 className="text-gray-500 dark:text-gray-300">Completed Tasks</h2>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 text-center">
          <h2 className="text-gray-500 dark:text-gray-300">Overdue Tasks</h2>
          <p className="text-2xl font-bold text-red-500">{overdueTasks}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
          <h3 className="text-gray-700 dark:text-gray-200 mb-2">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
          <h3 className="text-gray-700 dark:text-gray-200 mb-2">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Trend Line Chart */}
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 md:col-span-2">
          <h3 className="text-gray-700 dark:text-gray-200 mb-2">Task Completion Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={completionTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
