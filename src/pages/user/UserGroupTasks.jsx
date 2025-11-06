import React, { useMemo, useState } from "react";
import UserGroupTaskItem from "./UserGroupTaskItem";
import TaskFilters from "../../components/tasks/TaskFilters";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

function UserGroupTasks({ 
  darkMode, groupTasks, editingTaskId, updatedTask, setUpdatedTask, setEditingTaskId, 
  handleEdit, handleSave, handleDelete, onOpenComments, onSelectTask, user 
}) {
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All Priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 9;

  const filteredTasks = useMemo(() => {
    const byType = groupTasks.filter(task => {
      if (filterType === "All") return true;
      if (filterType === "Team") return !!task.teamName;
      if (filterType === "Custom") return !task.teamName;
      return true;
    });
    const todayStr = new Date().toISOString().split("T")[0];
    return byType.filter((task) => {
      const isOverdue = !!task.dueDate && task.status !== "Done" && task.dueDate < todayStr;
      const statusMatch = filterStatus === "All" ? true : filterStatus === "Overdue" ? isOverdue : task.status === filterStatus && !isOverdue;
      const priorityMatch = filterPriority === "All Priority" || task.priority === filterPriority;
      const searchMatch = !searchQuery || task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [groupTasks, filterType, filterStatus, filterPriority, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus, filterPriority, searchQuery]);

  return (
    <div className={`p-4 sm:p-6 pb-8 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">📋 Team Tasks</h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
      </p>

      {/* Toggle Filters Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(prev => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode 
              ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          {showFilters ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Collapsible Search and Filters Section */}
      {showFilters && (
        <>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                type="text"
                placeholder="Search by task name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400" 
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          {/* Filters */}
          <TaskFilters
            darkMode={darkMode}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            showStatus={true}
            showType={false}
            showPriority={true}
            showUser={false}
          />

          {/* Type Filter */}
          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Filter by Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {["All", "Team", "Custom"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    filterType === type
                      ? darkMode
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type === "All" && "📂 "}
                  {type === "Team" && "👥 "}
                  {type === "Custom" && "⚙️ "}
                  {type}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {filteredTasks.length === 0 ? (
        <p className={`mt-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {filterType === "All" ? "No team tasks available." : `No ${filterType.toLowerCase()} tasks available.`}
        </p>
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTasks.map(task => (
            <UserGroupTaskItem 
              key={task.id} 
              task={task}
              darkMode={darkMode}
              currentUser={user}
              isEditing={editingTaskId === task.id}
              editForm={updatedTask}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSave={() => handleSave(task.id)}
              onCancelEdit={() => setEditingTaskId(null)}
              onEditFormChange={setUpdatedTask}
              onToggleComments={() => onOpenComments(task)}
              onSelectTask={() => onSelectTask && onSelectTask(task)}
            />
          ))}
        </ul>

        {/* Pagination Controls */}
        {filteredTasks.length > tasksPerPage && (
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 mb-8 p-4 rounded-lg ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? darkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNumber
                            ? darkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <span key={pageNumber} className={`px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? darkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
}

export default UserGroupTasks;
