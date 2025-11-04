import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { db } from "../firebaseConfig";
import { collection, getDocs} from "firebase/firestore";
import { ClipboardList, Search, Plus, UserCircle } from "lucide-react";

function TasksTab({ darkMode, addActivityLog }) {
  const { user } = useAuth();
  const { tasks = [], addTask, updateTask, deleteTask, addComment } = useTasks();

  const [usersList, setUsersList] = useState([]); // Firebase user list
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: [], 
    status: "To Do",
    priority: "Low",
    dueDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentModalTask, setCommentModalTask] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All Priority");
  const [filterUser, setFilterUser] = useState("All Users");
  const [searchQuery, setSearchQuery] = useState("");

  const safeTasks = tasks || [];
  const visibleTasks =
    user?.role?.toLowerCase() === "admin"
      ? safeTasks
      : safeTasks.filter((t) => {
          // Handle both array (new format) and string (legacy format) for assignedTo
          if (Array.isArray(t.assignedTo)) {
            return t.assignedTo.some(
              (assignee) => assignee?.toLowerCase() === user?.username?.toLowerCase()
            );
          }
          return t.assignedTo?.toLowerCase() === user?.username?.toLowerCase();
        });
        
  // Apply filters
  const filteredTasks = visibleTasks.filter(task => {
    const statusMatch = filterStatus === "All" || task.status === filterStatus;
    const priorityMatch = filterPriority === "All Priority" || task.priority === filterPriority;
    
    // Handle both array and string for assignedTo
    let userMatch = filterUser === "All Users";
    if (!userMatch) {
      if (Array.isArray(task.assignedTo)) {
        userMatch = task.assignedTo.includes(filterUser);
      } else {
        userMatch = task.assignedTo === filterUser;
      }
    }
    
    // Search by task title or description
    const searchMatch = searchQuery.trim() === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && priorityMatch && userMatch && searchMatch;
  });

  /* ✅ Fetch users from Firebase */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(usersRef);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsersList(list);
      } catch (err) {
        console.error("Error loading users: ", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    alert("🟡 FORM SUBMITTED! Check console for details.");
    console.log("🟡 Form submitted with data:", form);
    
    if (!form.title || !form.assignedTo || form.assignedTo.length === 0) {
      console.warn("⚠️ Validation failed: Missing title or assigned users");
      alert("Please fill in title and assign at least one user");
      return;
    }

    const normalizedStatus =
      form.status.toLowerCase() === "completed" ? "Done" : form.status;

    if (editingId && editingId !== "new") {
      // Update existing task
      console.log("✏️ Updating existing task:", editingId);
      updateTask(editingId, { ...form, status: normalizedStatus });
    } else {
      // Create new task (local storage)
      console.log("📝 Creating new task with form data:", form);
      addTask({
        ...form,
        comments: [],
        status: normalizedStatus,
      });
    }

    // Reset form and close modal
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      assignedTo: [],
      status: "To Do",
      priority: "Low",
      dueDate: "",
    });
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  return (
    <>
      {/* Unified Header and Filter Section */}
      <div className={`mb-6 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${
        darkMode 
          ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
          : "from-blue-50 via-white to-purple-50 border border-blue-100"
      }`}>
        {/* Header with Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              <ClipboardList className="inline-block mr-2 mb-1" size={28} />
              Tasks
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Manage and track your team's tasks and projects
            </p>
          </div>
          <div className={`p-4 rounded-xl ${
            darkMode ? "bg-gray-700/50" : "bg-white/80"
          } shadow-sm`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {visibleTasks.length}
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Tasks</p>
            </div>
          </div>
        </div>

        {/* Search Bar with New Task Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mb-5">
          <div className="flex-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Search Tasks
            </label>
            <Search className={`absolute left-3 bottom-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`} size={18} />
            <input
              type="text"
              placeholder="Search by task name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl font-medium shadow-sm transition-all border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600 placeholder-gray-400" 
                  : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100 placeholder-gray-500"
              }`}
            />
          </div>
          {user?.role?.toLowerCase() === "admin" && (
            <button
              onClick={() => {
                setEditingId("new");
                setForm({
                  title: "",
                  description: "",
                  assignedTo: [],
                  status: "To Do",
                  priority: "Low",
                  dueDate: "",
                });
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              New Task
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="mb-5">
          <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
            Filter by Status
          </label>
          <div className="flex gap-2 flex-wrap">
            {["All", "To Do", "In Progress", "Done"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
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
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Priority and User Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Priority Filters */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Priority Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {["All Priority", "High", "Medium", "Low"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority(priority)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
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

          {/* User Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-3 block opacity-70">
              Assigned User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all ${
                darkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600" 
                  : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
              } border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="All Users">👥 All Users</option>
              {usersList
                .filter((u) => u.role?.toLowerCase() !== "admin")
                .map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.name || u.username}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task Creation/Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className="text-xl font-semibold mb-4">
              {editingId === "new" ? "New Task" : "Edit Task"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Title - Admin only for new tasks, editable for admins editing */}
              {(user?.role?.toLowerCase() === "admin" || editingId !== "new") && (
                <input
                  type="text"
                  placeholder="Task Title"
                  required
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={user?.role?.toLowerCase() !== "admin" && editingId !== "new"}
                />
              )}

              {/* Description - Admin only for new tasks */}
              {(user?.role?.toLowerCase() === "admin" || editingId !== "new") && (
                <textarea
                  placeholder="Task Description"
                  rows="3"
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={user?.role?.toLowerCase() !== "admin" && editingId !== "new"}
                />
              )}

              {/* Assign Users - Admin only - Multi Select */}
              {user?.role?.toLowerCase() === "admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assign Users</label>
                  <MultiSelectDropdown
                    options={usersList
                      .filter((u) => u.role?.toLowerCase() !== "admin")
                      .map((u) => ({
                        id: u.id,
                        value: u.username,
                        label: u.name || u.username,
                      }))}
                    selected={form.assignedTo || []}
                    onChange={(selectedUsers) => setForm({ ...form, assignedTo: selectedUsers })}
                    placeholder="Select users to assign..."
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Status - Everyone can edit */}
              <select
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>

              {/* Priority - Admin only */}
              {user?.role?.toLowerCase() === "admin" && (
                <select
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              )}

              {/* Due Date - Admin only */}
              {user?.role?.toLowerCase() === "admin" && (
                <input
                  type="date"
                  min={today}
                  className={`w-full border p-2 rounded ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                  }`}
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  {editingId === "new" ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      title: "",
                      description: "",
                      assignedTo: [],
                      status: "To Do",
                      priority: "Low",
                      dueDate: "",
                    });
                  }}
                  className={`px-4 py-2 rounded-md border ${
                    darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group relative p-4 rounded-xl shadow-md border-l-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                task.priority === "High"
                  ? darkMode 
                    ? "border-l-rose-500 bg-gradient-to-br from-rose-900/20 to-gray-900/60" 
                    : "border-l-rose-500 bg-gradient-to-br from-rose-50 to-white"
                  : task.priority === "Medium"
                  ? darkMode
                    ? "border-l-amber-500 bg-gradient-to-br from-amber-900/20 to-gray-900/60"
                    : "border-l-amber-500 bg-gradient-to-br from-amber-50 to-white"
                  : darkMode
                    ? "border-l-sky-500 bg-gradient-to-br from-sky-900/20 to-gray-900/60"
                    : "border-l-sky-500 bg-gradient-to-br from-sky-50 to-white"
              }`}
            >
              {/* Priority Corner Badge */}
              <div className="absolute top-0 right-0">
                <div
                  className={`px-3 py-0.5 rounded-bl-xl rounded-tr-xl text-xs font-bold shadow-sm ${
                    task.priority === "High"
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      : task.priority === "Medium"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                  }`}
                >
                  {task.priority}
                </div>
              </div>

              {/* Header */}
              <div className="mb-3 mt-1">
                <h3 
                  onClick={() => setSelectedTask(task)}
                  className={`font-bold text-lg mb-2 pr-14 leading-tight cursor-pointer hover:underline transition-all ${
                    darkMode ? "text-gray-100 hover:text-blue-400" : "text-gray-900 hover:text-blue-600"
                  }`}
                >
                  {task.title}
                </h3>
                
                {/* Status Badge with Icon */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                      task.status === "Done"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                        : task.status === "In Progress"
                        ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                        : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
                    }`}
                  >
                    {task.status === "Done" && "✓"}
                    {task.status === "In Progress" && "⟳"}
                    {task.status === "To Do" && "○"}
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm mb-2 line-clamp-2 leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                {task.description || "No description provided"}
              </p>

              {/* Task Info with Icons */}
              <div className={`space-y-2 mb-2 pb-2 border-t pt-2 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex items-start gap-2">
                  <UserCircle size={18} className={`mt-0.5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  <div className="flex-1">
                    <div className={`text-xs font-semibold mb-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>Assigned to:</div>
                    {Array.isArray(task.assignedTo) ? (
                      <div className="flex flex-wrap gap-1.5">
                        {task.assignedTo.map((user, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              darkMode 
                                ? "bg-indigo-600 text-indigo-100" 
                                : "bg-indigo-500 text-white"
                            }`}
                          >
                            {user}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}>{task.assignedTo}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📆</span>
                  <div>
                    <div className={`text-xs font-semibold ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}>Due Date:</div>
                    <span className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : "No deadline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Convert assignedTo to array format for the dropdown
                      let assignedToArray = [];
                      if (Array.isArray(task.assignedTo)) {
                        assignedToArray = task.assignedTo;
                      } else if (task.assignedTo && typeof task.assignedTo === 'string') {
                        // If it's a string, convert to array (could be comma-separated or single value)
                        assignedToArray = task.assignedTo.includes(',') 
                          ? task.assignedTo.split(',').map(u => u.trim())
                          : [task.assignedTo];
                      }
                      
                      setForm({
                        ...task,
                        assignedTo: assignedToArray
                      });
                      setEditingId(task.id);
                    }}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    ✏️ Edit
                  </button>
                  {user?.role?.toLowerCase() === "admin" && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setCommentModalTask(task)}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  💬 Comments ({task.comments?.length || 0})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className={`inline-block p-8 rounded-2xl ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}>
              <p className="text-6xl mb-4">📋</p>
              <p className="text-xl font-semibold mb-2">No tasks available</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {user?.role?.toLowerCase() === "admin" 
                  ? "Create a new task to get started!" 
                  : "No tasks assigned to you yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Comments Modal */}
      {commentModalTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className={`p-6 rounded-lg w-[400px] shadow-xl ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          }`}>
            <h3 className="text-lg font-semibold mb-3">
              Comments — {commentModalTask.title}
            </h3>

            <div className={`border rounded p-2 max-h-[250px] overflow-y-auto mb-3 ${
              darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              {commentModalTask.comments?.length ? (
                commentModalTask.comments.map((c) => (
                  <div key={c.id} className={`border-b pb-2 mb-2 ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}>
                    <p className={darkMode ? "text-gray-100" : "text-gray-900"}>{c.text}</p>
                    <small className={darkMode ? "text-gray-400" : "text-gray-500"}>
                      — {c.author} • {c.time && !isNaN(new Date(c.time).getTime()) ? new Date(c.time).toLocaleString() : new Date().toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No comments yet.</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add comment..."
                className={`border p-2 rounded flex-1 ${
                  darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                }`}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!commentInput.trim()) return;

                  const newComment = {
                    id: Date.now(),
                    text: commentInput,
                    author: user.username,
                    time: new Date().toISOString(),
                  };

                  addComment(commentModalTask.id, newComment);
                  setCommentInput("");

                  setCommentModalTask((prev) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment],
                  }));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
              >
                Add
              </button>
            </div>

            <button
              className="bg-red-600 hover:bg-red-700 text-white w-full py-2 rounded"
              onClick={() => setCommentModalTask(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Full Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            {/* Header */}
            <div className={`flex items-start justify-between mb-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex-1 pr-4">
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {selectedTask.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    selectedTask.status === "Done"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                      : selectedTask.status === "In Progress"
                      ? "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
                      : "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800"
                  }`}>
                    {selectedTask.status}
                  </span>
                  {/* Priority Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    selectedTask.priority === "High"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : selectedTask.priority === "Medium"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  }`}>
                    {selectedTask.priority} Priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-220px)] pr-2">
              {/* Description */}
              <div className="mb-6">
                <h4 className={`font-semibold mb-2 text-sm uppercase tracking-wider ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Description:
                </h4>
                <div className={`border rounded-xl p-4 text-sm max-h-[300px] overflow-y-auto whitespace-pre-wrap ${
                  darkMode 
                    ? "bg-gray-900 border-gray-700 text-gray-300" 
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}>
                  {selectedTask.description || "No description provided"}
                </div>
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Assigned To */}
                <div>
                  <h4 className={`font-semibold mb-2 text-sm uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Assigned To:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedTask.assignedTo) ? (
                      selectedTask.assignedTo.map((user, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                            darkMode 
                              ? "bg-indigo-600 text-indigo-100" 
                              : "bg-indigo-500 text-white"
                          }`}
                        >
                          {user}
                        </span>
                      ))
                    ) : (
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {selectedTask.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <h4 className={`font-semibold mb-2 text-sm uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Due Date:
                  </h4>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {selectedTask.dueDate 
                      ? new Date(selectedTask.dueDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "No deadline set"}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <div>
                  <h4 className={`font-semibold mb-3 text-sm uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Comments ({selectedTask.comments.length}):
                  </h4>
                  <div className="space-y-2">
                    {selectedTask.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-gray-900" : "bg-gray-50"
                        }`}
                      >
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {comment.text}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {comment.author} • {new Date(comment.time).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default TasksTab;