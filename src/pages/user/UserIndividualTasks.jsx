import React from "react";
import UserTaskItem from "./UserTaskItem";

function UserIndividualTasks({ 
  darkMode, 
  individualTasks, 
  editingTaskId, 
  updatedTask, 
  commentInput,
  openCommentsTaskId, 
  setUpdatedTask, 
  setCommentInput, 
  setEditingTaskId,
  setOpenCommentsTaskId, 
  handleEdit, 
  handleSave, 
  handleDelete, 
  addComment, 
  user 
}) {
  return (
    <div className={`p-4 sm:p-6 rounded-2xl shadow ${darkMode ? "bg-gray-800" : "bg-white/90"}`}>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">✅ My Individual Tasks</h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        Tasks assigned only to you
      </p>

      {individualTasks.length === 0 ? (
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>No individual tasks available.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {individualTasks.map(task => (
            <UserTaskItem 
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

export default UserIndividualTasks;
