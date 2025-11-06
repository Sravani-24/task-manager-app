import React from "react";

export default function TaskFilters({
  darkMode,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filterPriority,
  setFilterPriority,
  filterUser,
  setFilterUser,
  usersList,
  // Optional visibility flags to allow reuse in user pages
  showStatus = true,
  showType = true,
  showPriority = true,
  showUser = true,
}) {
  return (
    <>
      {/* Status and Priority Filters */}
      <div className="mb-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Filter */}
        {showStatus && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Filter by Status
            </label>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {["All", "To Do", "In Progress", "Done", "Overdue"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus && setFilterStatus(status)}
                  className={`px-2.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "All" && "📋 "}
                  {status === "To Do" && "○ "}
                  {status === "In Progress" && "⟳ "}
                  {status === "Done" && "✓ "}
                  {status === "Overdue" && "⚠️ "}
                  <span className="hidden xs:inline">{status}</span>
                  <span className="xs:hidden">
                    {status === "All" && "All"}
                    {status === "To Do" && "To Do"}
                    {status === "In Progress" && "Progress"}
                    {status === "Done" && "Done"}
                    {status === "Overdue" && "Overdue"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Priority Filters */}
        {showPriority && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Priority Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {["All Priority", "High", "Medium", "Low"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority && setFilterPriority(priority)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    filterPriority === priority
                      ? priority === "High"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                        : priority === "Medium"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                        : priority === "Low"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {priority === "High" && "🔴 "}
                  {priority === "Medium" && "🟡 "}
                  {priority === "Low" && "🔵 "}
                  {priority}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Type and User Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task Type Filter */}
        {showType && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Filter by Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {["All Tasks", "Individual Task", "Team Task", "Custom Task"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType && setFilterType(type)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    filterType === type
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "All Tasks" && "◆ "}
                  {type === "Individual Task" && "👤 "}
                  {type === "Team Task" && "👥 "}
                  {type === "Custom Task" && "⚙️ "}
                  <span className="hidden sm:inline">{type}</span>
                  <span className="sm:hidden">
                    {type === "All Tasks" && "All"}
                    {type === "Individual Task" && "Individual"}
                    {type === "Team Task" && "Team"}
                    {type === "Custom Task" && "Custom"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Filter */}
        {showUser && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Assigned User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser && setFilterUser(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all ${
                darkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                  : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
              } border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="All Users">👥 All Users</option>
              {(usersList || [])
                .filter((u) => u.role?.toLowerCase() !== "admin")
                .map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.name || u.username}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
}
