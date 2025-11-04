import React, { useState, useEffect } from "react";
import NotificationPopup from "../../components/NotificationPopup";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Users, Mail, Shield, UserCircle, Edit2, Trash2, X, Plus, Search } from "lucide-react";

function UsersTab({ darkMode }) {
  const { register } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", role: "user", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification and Confirmation states
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  //Fetch users from Firestore
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by role and search
  const filteredUsers = users.filter(user => {
    const roleMatch = 
      roleFilter === "All" || 
      (roleFilter === "Admin" && user.role?.toLowerCase() === "admin") ||
      (roleFilter === "User" && user.role?.toLowerCase() === "user");
    
    const searchMatch = searchQuery.trim() === "" ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return roleMatch && searchMatch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email) {
      setNotification({
        message: "Fill all fields",
        type: "warning"
      });
      return;
    }

    if (editingUser) {
      const oldUsername = editingUser.username;
      const newUsername = form.username;
      
      // If username changed, propagate changes to localStorage
      if (oldUsername !== newUsername) {
        try {
          // Update tasks
          const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
          const updatedTasks = storedTasks.map(task => {
            let updated = { ...task };
            
            // Update task creator
            if (updated.user === oldUsername) {
              updated.user = newUsername;
            }
            
            // Update assignedTo
            if (Array.isArray(updated.assignedTo)) {
              updated.assignedTo = updated.assignedTo.map(u => u === oldUsername ? newUsername : u);
            } else if (updated.assignedTo === oldUsername) {
              updated.assignedTo = newUsername;
            }
            
            // Update comments
            if (updated.comments && Array.isArray(updated.comments)) {
              updated.comments = updated.comments.map(comment => ({
                ...comment,
                author: comment.author === oldUsername ? newUsername : comment.author
              }));
            }
            
            return updated;
          });
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));
          
          // Update teams
          const storedTeams = JSON.parse(localStorage.getItem("teams")) || [];
          const updatedTeams = storedTeams.map(team => ({
            ...team,
            members: team.members.map(m => m === oldUsername ? newUsername : m)
          }));
          localStorage.setItem("teams", JSON.stringify(updatedTeams));
          
          // Update activity logs
          const storedActivityLog = JSON.parse(localStorage.getItem("activityLog")) || [];
          const updatedActivityLog = storedActivityLog.map(entry => ({
            ...entry,
            user: entry.user === oldUsername ? newUsername : entry.user
          }));
          localStorage.setItem("activityLog", JSON.stringify(updatedActivityLog));
          
        } catch (error) {
          console.error("Error propagating username change:", error);
        }
      }
      
      //Update user role / name in Firestore
      await updateDoc(doc(db, "users", editingUser.id), {
        username: form.username,
        email: form.email,
        role: form.role
      });

      setEditingUser(null);
      
      if (oldUsername !== newUsername) {
        setNotification({
          message: "User updated and username propagated across all tasks, teams, and activity logs. Refreshing...",
          type: "success",
          onClose: () => window.location.reload()
        });
      } else {
        setNotification({
          message: "User updated",
          type: "success"
        });
      }
    } else {
      //Admin creates a new Firebase user
      try {
        await register(form.email, form.password, form.username, form.role);
        setNotification({
          message: "New user created ✅",
          type: "success"
        });
      } catch (err) {
        setNotification({
          message: err.message,
          type: "error"
        });
      }
    }

    setForm({ username: "", email: "", role: "user", password: "" });
    setShowAddUserModal(false); // Close modal after submit
    fetchUsers();
  };

  // Edit button
  const handleEdit = (u) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      email: u.email,
      role: u.role,
      password: ""
    });
  };

  // Delete user from Firestore
  const handleDelete = async (id) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    
    setConfirmDialog({
      message: "Delete this user? They will be removed from all assigned tasks and replaced with 'Deleted User' in comments and activity logs.",
      onConfirm: () => {
        performDelete(id, userToDelete.username);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const performDelete = async (id, username) => {
    
    // Remove user from all tasks in localStorage
    try {
      const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const updatedTasks = storedTasks.map(task => {
        let updatedTask = { ...task };
        
        // 1. Update task creator field (task.user)
        if (updatedTask.user === username) {
          updatedTask.user = "Deleted User";
        }
        
        // 2. Update comments - replace deleted user's name with "Deleted User"
        if (updatedTask.comments && Array.isArray(updatedTask.comments)) {
          updatedTask.comments = updatedTask.comments.map(comment => ({
            ...comment,
            author: comment.author === username ? "Deleted User" : comment.author
          }));
        }
        
        // 3. Handle assignedTo field
        if (updatedTask.assignedTo) {
          // Handle array of users (group/custom tasks)
          if (Array.isArray(updatedTask.assignedTo)) {
            const filteredUsers = updatedTask.assignedTo.filter(user => user !== username);
            // If no users left after removal, mark task as unassigned or delete it
            if (filteredUsers.length > 0) {
              updatedTask.assignedTo = filteredUsers;
            } else {
              // Task has no assignees left - delete it
              return null;
            }
          }
          // Handle single user (individual tasks)
          else if (updatedTask.assignedTo === username) {
            // Remove the task if it was assigned only to the deleted user
            return null;
          }
        }
        
        return updatedTask;
      }).filter(task => task !== null); // Remove null tasks
      
      // Save updated tasks back to localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      
      // 4. Update activity log - replace deleted user's name with "Deleted User"
      const storedActivityLog = JSON.parse(localStorage.getItem("activityLog")) || [];
      const updatedActivityLog = storedActivityLog.map(entry => ({
        ...entry,
        user: entry.user === username ? "Deleted User" : entry.user
      }));
      localStorage.setItem("activityLog", JSON.stringify(updatedActivityLog));
      
      // 5. Remove from teams
      const storedTeams = JSON.parse(localStorage.getItem("teams")) || [];
      const updatedTeams = storedTeams.map(team => ({
        ...team,
        members: team.members.filter(member => member !== username)
      })).filter(team => team.members.length > 0); // Remove empty teams
      
      localStorage.setItem("teams", JSON.stringify(updatedTeams));
      
    } catch (error) {
      console.error("Error cleaning up user from tasks/teams:", error);
    }
    
    // Delete user from Firestore
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
    
    // Reload page to reflect changes
    setNotification({
      message: `User "${username}" deleted and cleaned up across the platform. Refreshing...`,
      type: "success",
      onClose: () => window.location.reload()
    });
  };

  return (
    <>
      {/* Header Section with Stats */}
      <div className={`mb-6 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${
        darkMode 
          ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
          : "from-blue-50 via-white to-purple-50 border border-blue-100"
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              <Users className="inline-block mr-2 mb-1" size={28} />
              User Management
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Manage and organize your team members
            </p>
          </div>
          <div className={`flex gap-4 p-4 rounded-xl ${
            darkMode ? "bg-gray-700/50" : "bg-white/80"
          } shadow-sm`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {users.filter(u => u.role?.toLowerCase() !== "admin").length}
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Users</p>
            </div>
            <div className="text-center border-l pl-4">
              <p className={`text-2xl font-bold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
                {users.filter(u => u.role?.toLowerCase() === "admin").length}
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Admins</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`} size={18} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl font-medium shadow-sm transition-all border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400" 
                  : "bg-white text-gray-900 border-gray-200 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Role Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {["All", "User", "Admin"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                  roleFilter === role
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {role === "All" && <Users size={16} />}
                {role === "User" && <UserCircle size={16} />}
                {role === "Admin" && <Shield size={16} />}
                {role}
              </button>
            ))}
          </div>

          {/* Add User Button */}
          <button
            onClick={() => {
              setEditingUser(null);
              setForm({ username: "", email: "", role: "user", password: "" });
              setShowAddUserModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-fadeIn">
          <div className={`p-6 rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-scaleIn ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {editingUser ? (
                  <>
                    <Edit2 className="inline-block mr-2 mb-1" size={22} />
                    Edit User
                  </>
                ) : (
                  <>
                    <Plus className="inline-block mr-2 mb-1" size={22} />
                    Add New User
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setForm({ username: "", email: "", role: "user", password: "" });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <UserCircle className="inline-block mr-1 mb-0.5" size={16} />
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  required
                  className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <Mail className="inline-block mr-1 mb-0.5" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  required
                  className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              
              {/* Password Input (only for new users) */}
              {!editingUser && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    🔒 Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    required
                    className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    }`}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <Shield className="inline-block mr-1 mb-0.5" size={16} />
                  Role
                </label>
                <select
                  className={`w-full border-2 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">👤 User</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {editingUser ? "💾 Update User" : "✨ Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                    setForm({ username: "", email: "", role: "user", password: "" });
                  }}
                  className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all hover:scale-105 ${
                    darkMode 
                      ? "border-gray-600 hover:bg-gray-700 text-gray-300" 
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Grid/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u, index) => (
            <div
              key={u.id}
              className={`group relative p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform animate-slideUp ${
                darkMode 
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50" 
                  : "bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-400"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Role Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1 ${
                  u.role === "admin" 
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                }`}>
                  {u.role === "admin" ? <Shield size={12} /> : <UserCircle size={12} />}
                  {u.role?.toUpperCase()}
                </span>
              </div>

              {/* User Avatar */}
              <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl font-bold shadow-lg ${
                u.role === "admin"
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                  : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              }`}>
                {u.username?.charAt(0).toUpperCase() || "U"}
              </div>

              {/* User Info */}
              <div className="mb-4">
                <h3 className={`text-lg font-bold mb-2 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}>
                  {u.username}
                </h3>
                <div className={`flex items-center gap-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  <Mail size={14} />
                  <span className="truncate">{u.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-2 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  onClick={() => {
                    handleEdit(u);
                    setShowAddUserModal(true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  } shadow-md hover:shadow-lg`}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(u.id)} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 ${
                    darkMode
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  } shadow-md hover:shadow-lg`}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className={`inline-block p-12 rounded-3xl shadow-xl animate-scaleIn ${
              darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" : "bg-gradient-to-br from-gray-50 to-white border border-gray-200"
            }`}>
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}>
                <Users size={48} className={`${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`} />
              </div>
              <p className={`text-2xl font-bold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}>
                No users found
              </p>
              <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {searchQuery ? "Try adjusting your search or filters" : "Click 'Add User' to create your first user"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setForm({ username: "", email: "", role: "user", password: "" });
                    setShowAddUserModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Your First User
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Popup */}
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          darkMode={darkMode}
          onClose={() => {
            if (notification.onClose) {
              notification.onClose();
            }
            setNotification(null);
          }}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          darkMode={darkMode}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </>
  );
}
export default UsersTab;;