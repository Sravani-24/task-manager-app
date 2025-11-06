import React from "react";

function UserDashboard({ darkMode, userTasks, parseLocalDate }) {
  const data = [
    { name: "To Do", value: userTasks.filter(t => t.status === "To Do").length },
    { name: "In Progress", value: userTasks.filter(t => t.status === "In Progress").length },
    { name: "Done", value: userTasks.filter(t => t.status === "Done").length },
  ];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const inSevenDays = new Date(startOfToday);
  inSevenDays.setDate(inSevenDays.getDate() + 7);

  const withValidDeadline = (t) => t.dueDate && parseLocalDate(t.dueDate);

  const dueSoonTasks = userTasks
    .filter((t) => withValidDeadline(t) && t.status !== "Done")
    .filter((t) => {
      const due = parseLocalDate(t.dueDate);
      return due >= startOfToday && due <= inSevenDays;
    })
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));

  const overdueTasks = userTasks
    .filter((t) => withValidDeadline(t) && t.status !== "Done")
    .filter((t) => parseLocalDate(t.dueDate) < startOfToday)
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));

  return (
    <div className={`p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">📈 Dashboard Overview</h2>
      <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
        Quick summary of your tasks
      </p>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Total" value={userTasks.length} color={darkMode ? "bg-gray-700" : "bg-blue-100"} />
        <Card title="To Do" value={data[0].value} color={darkMode ? "bg-gray-700" : "bg-gray-200"} />
        <Card title="In Progress" value={data[1].value} color={darkMode ? "bg-gray-700" : "bg-amber-100"} />
        <Card title="Done" value={data[2].value} color={darkMode ? "bg-gray-700" : "bg-emerald-100"} />
      </div>

      {/* Due Soon & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Due soon (next 7 days) */}
        <div className={`${darkMode ? "bg-gray-900/40" : "bg-slate-100"} rounded-xl p-4 border ${darkMode ? "border-gray-700" : "border-slate-200"} flex flex-col`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">⏳ Due in next 7 days</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-slate-700"}`}>{dueSoonTasks.length}</span>
          </div>
          {dueSoonTasks.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>No upcoming deadlines.</p>
          ) : (
            <ul className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '260px' }}>
              {dueSoonTasks.map((t) => (
                <li key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
                  <div className="text-xl leading-none">📆</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium truncate">{t.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        t.priority === "High"
                          ? "bg-rose-500 text-white"
                          : t.priority === "Medium"
                          ? "bg-amber-500 text-white"
                          : "bg-sky-500 text-white"
                      }`}>{t.priority}</span>
                    </div>
                    <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>
                      Due {new Date(parseLocalDate(t.dueDate)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue */}
        <div className={`${darkMode ? "bg-gray-900/40" : "bg-slate-100"} rounded-xl p-4 border ${darkMode ? "border-gray-700" : "border-slate-200"} ${overdueTasks.length === 0 ? 'flex-shrink-0 self-start' : 'flex flex-col'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">⚠️ Overdue</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-slate-700"}`}>{overdueTasks.length}</span>
          </div>
          {overdueTasks.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>No overdue tasks. Nice!</p>
          ) : (
            <ul className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '260px' }}>
              {overdueTasks.map((t) => (
                <li key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
                  <div className="text-xl leading-none">⏰</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium truncate">{t.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white whitespace-nowrap">Overdue</span>
                    </div>
                    <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mt-1`}>
                      Was due {new Date(parseLocalDate(t.dueDate)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`p-3 sm:p-4 rounded-xl text-center shadow ${color}`}>
      <h3 className="text-sm sm:text-lg font-semibold">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </div>
  );
}

export default UserDashboard;
