import React, { useMemo, useState } from "react";
import UserTaskItem from "./UserTaskItem";
import TaskFilters from "../../components/tasks/TaskFilters";
import { Search } from "lucide-react";

function UserIndividualTasks({ 
  darkMode, 
  individualTasks, 
  editingTaskId, 
  updatedTask, 
  setUpdatedTask, 
  setEditingTaskId,
  handleEdit, 
  handleSave, 
  handleDelete, 
  onOpenComments,
  onSelectTask,
  user 
}) {
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All Priority");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 9;

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(individualTasks)) return [];
    const todayStr = new Date().toISOString().split("T")[0];
    return individualTasks.filter((task) => {
      const isOverdue = !!task.dueDate && task.status !== "Done" && task.dueDate < todayStr;
      const statusMatch =
        filterStatus === "All"
          ? true
          : filterStatus === "Overdue"
          ? isOverdue
          : task.status === filterStatus && !isOverdue;
      
      const priorityMatch = 
        filterPriority === "All Priority" || task.priority === filterPriority;
      
      const searchMatch = 
        !searchQuery ||
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [individualTasks, filterStatus, filterPriority, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, searchQuery]);

  return (
    <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">✅ My Individual Tasks</h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
      </p>

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

      {filteredTasks.length === 0 ? (
        <p className={`mt-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No individual tasks available.</p>
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTasks.map(task => (
            <UserTaskItem 
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

export default UserIndividualTasks;
