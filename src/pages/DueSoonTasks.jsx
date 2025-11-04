import React from "react";

/* Due Soon Tasks Component */
export default function DueSoonTasks({ tasks, darkMode }) {
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  // Filter tasks that are not done and have a due date within the next 7 days
  const dueSoonTasks = tasks
    .filter(task => {
      if (task.status === "Done" || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil, darkMode) => {
    if (daysUntil === 0) return darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800";
    if (daysUntil <= 2) return darkMode ? "bg-orange-900 text-orange-200" : "bg-orange-100 text-orange-800";
    return darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800";
  };

  if (dueSoonTasks.length === 0) {
    return (
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No tasks due in the next 7 days. Great job staying on top of things! 🎉
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {dueSoonTasks.map((task) => {
        const daysUntil = getDaysUntilDue(task.dueDate);
        const urgencyColor = getUrgencyColor(daysUntil, darkMode);

        return (
          <div
            key={task.id}
            className={`p-4 rounded-lg border-l-4 ${
              daysUntil === 0
                ? "border-l-red-500"
                : daysUntil <= 2
                ? "border-l-orange-500"
                : "border-l-yellow-500"
            } ${darkMode ? "bg-gray-900/50" : "bg-slate-50"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${urgencyColor}`}>
                    {daysUntil === 0 ? "Due Today!" : daysUntil === 1 ? "Due Tomorrow" : `Due in ${daysUntil} days`}
                  </span>
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    task.status === "In Progress"
                      ? darkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                      : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                  }`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    task.priority === "High"
                      ? darkMode ? "bg-rose-900 text-rose-200" : "bg-rose-100 text-rose-800"
                      : task.priority === "Medium"
                      ? darkMode ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-800"
                      : darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Due Date
                </div>
                <div className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                  {new Date(task.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
