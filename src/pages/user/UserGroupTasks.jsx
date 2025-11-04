import React, { useState } from "react";
import UserGroupTaskItem from "./UserGroupTaskItem";

function UserGroupTasks({ darkMode, groupTasks, editingTaskId, updatedTask, commentInput, openCommentsTaskId, 
  setUpdatedTask, setCommentInput, setEditingTaskId, setOpenCommentsTaskId, 
  handleEdit, handleSave, handleDelete, addComment, user }) {
  
  const [filterType, setFilterType] = useState("All");

  // Filter tasks based on type
  const filteredTasks = groupTasks.filter(task => {
    if (filterType === "All") return true;
    if (filterType === "Group") return task.teamName; // Has team name = group task
    if (filterType === "Custom") return !task.teamName; // No team name = custom task
    return true;
  });

  return (
    <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">📋 Team Tasks</h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        Tasks shared with multiple team members
      </p>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", "Group", "Custom"].map((type) => (
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
            {type === "Group" && "👥 "}
            {type === "Custom" && "⚙️ "}
            {type}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {filterType === "All" ? "No group tasks available." : `No ${filterType.toLowerCase()} tasks available.`}
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <UserGroupTaskItem 
              key={task.id} 
              task={task}
              darkMode={darkMode}
              editingTaskId={editingTaskId}
              updatedTask={updatedTask}
              commentInput={commentInput}
              openCommentsTaskId={openCommentsTaskId}
              setUpdatedTask={setUpdatedTask}
              setCommentInput={setCommentInput}
              setEditingTaskId={setEditingTaskId}
              setOpenCommentsTaskId={setOpenCommentsTaskId}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleDelete={handleDelete}
              addComment={addComment}
              user={user}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserGroupTasks;
