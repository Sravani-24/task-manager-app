import React from "react";

function TaskItem({
  task, darkMode, editingTaskId, updatedTask, commentInput, openCommentsTaskId,
  setUpdatedTask, setCommentInput, setEditingTaskId, setOpenCommentsTaskId,
  handleEdit, handleSave, handleDelete, addComment, user
}) {
  return (
    <li className={`relative border-l-4 p-5 rounded-xl shadow-lg transition-all hover:shadow-xl ${
      task.priority === "High"
        ? darkMode 
          ? "border-l-rose-500 bg-gradient-to-br from-rose-900/20 to-gray-800/50" 
          : "border-l-rose-500 bg-gradient-to-br from-rose-50 to-white"
        : task.priority === "Medium"
        ? darkMode
          ? "border-l-amber-500 bg-gradient-to-br from-amber-900/20 to-gray-800/50"
          : "border-l-amber-500 bg-gradient-to-br from-amber-50 to-white"
        : darkMode
          ? "border-l-sky-500 bg-gradient-to-br from-sky-900/20 to-gray-800/50"
          : "border-l-sky-500 bg-gradient-to-br from-sky-50 to-white"
    }`}>
      {editingTaskId === task.id ? (
        <div className="space-y-3">
          <input type="text"
            className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
            value={updatedTask.title} onChange={(e)=>setUpdatedTask({...updatedTask,title:e.target.value})}
          />

          <textarea
            className={`w-full p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
            value={updatedTask.description}
            onChange={(e)=>setUpdatedTask({...updatedTask,description:e.target.value})}
          />

          <select
            className={`p-2 border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
            value={updatedTask.status} onChange={(e)=>setUpdatedTask({...updatedTask,status:e.target.value})}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <div className="flex gap-2">
            <button className={`${darkMode ? "bg-green-600" : "bg-green-500"} text-white px-4 py-2 rounded-md hover:opacity-90`}
              onClick={()=>handleSave(task.id)}>Save</button>
            <button className={`${darkMode ? "bg-gray-600" : "bg-gray-300"} px-4 py-2 rounded-md hover:opacity-90`}
              onClick={()=>setEditingTaskId(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Priority Corner Badge */}
          <div className="absolute top-0 right-0">
            <div className={`px-3 py-0.5 rounded-bl-xl rounded-tr-xl text-xs font-bold shadow-sm ${
              task.priority === "High"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                : task.priority === "Medium"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
            }`}>
              {task.priority}
            </div>
          </div>

          {/* Header */}
          <div className="mb-3 mt-1">
            <h3 className={`font-bold text-lg mb-2 pr-14 leading-tight ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}>
              {task.title}
            </h3>
            
            {/* Status Badge with Icon */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                task.status === "Done"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                  : task.status === "In Progress"
                  ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                  : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
              }`}>
                {task.status === "Done" && "✓"}
                {task.status === "In Progress" && "⟳"}
                {task.status === "To Do" && "○"}
                {task.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-3 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {task.description || "No description provided"}
          </p>

          {/* Comments */}
          <div className="mb-3">
            <button onClick={()=>setOpenCommentsTaskId(openCommentsTaskId===task.id?null:task.id)}
              className={`${darkMode?"text-blue-400 hover:text-blue-300":"text-blue-600 hover:text-blue-700"} text-sm font-medium transition-colors`}>
              💬 {Array.isArray(task.comments) ? `${task.comments.length} comments` : "Add comment"}
            </button>
          </div>

          {openCommentsTaskId===task.id && (
            <div className={`mb-3 p-3 rounded-lg ${darkMode?"bg-gray-900/50":"bg-slate-100"}`}>
              <div className="flex gap-2">
                <input value={commentInput}
                  onChange={(e)=>setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className={`flex-1 p-2 border rounded ${darkMode?"bg-gray-800 border-gray-700 text-white":"bg-white border-slate-300"}`}
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                  onClick={()=>{ 
                    if(!commentInput.trim())return;
                    const newComment = {
                      id: Date.now(),
                      text: commentInput.trim(),
                      author: user.username,
                      createdAt: new Date().toISOString()
                    };
                    addComment(task.id, newComment); 
                    setCommentInput(""); 
                  }}>
                  Add
                </button>
                <button className={`px-3 py-2 rounded font-medium transition-colors ${darkMode?"bg-gray-700 text-white hover:bg-gray-600":"bg-gray-300 text-black hover:bg-gray-400"}`}
                  onClick={()=>{ setOpenCommentsTaskId(null); setCommentInput(""); }}>Close</button>
              </div>

              <ul className="mt-2 space-y-2">
                {(task.comments||[]).map((c)=>(
                  <li key={c.id} className={`p-2 border rounded text-xs ${darkMode?"border-gray-700 bg-gray-800":"border-slate-200 bg-white"}`}>
                    {c.text}
                    <div className="text-[10px] opacity-70 mt-1">{c.author} • {new Date(c.createdAt).toLocaleString()}</div>
                  </li>
                ))}
                {(!task.comments || task.comments.length===0) && <li className="text-xs opacity-70">No comments yet.</li>}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
              onClick={()=>handleEdit(task)}>
              ✏️ Edit
            </button>
            {user.role==="admin" && (
              <button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                onClick={()=>handleDelete(task.id)}>
                🗑️ Delete
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
}

export default TaskItem;
