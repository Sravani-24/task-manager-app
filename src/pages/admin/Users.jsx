import React, { useState, useEffect } from "react";
import NotificationPopup from "../../components/common/NotificationPopup";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UsersHeader from "../../components/users/UsersHeader";
import UserCard from "../../components/users/UserCard";
import UserModal from "../../components/users/UserModal";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Users, Plus } from "lucide-react";

function UsersTab({ darkMode }) {
  const { createUser } = useAuth();
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
        await createUser(form.email, form.password, form.username, form.role);
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
      <UsersHeader
        darkMode={darkMode}
        usersCount={users.filter(u => u.role?.toLowerCase() !== "admin").length}
        adminsCount={users.filter(u => u.role?.toLowerCase() === "admin").length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        onAddUser={() => {
          setEditingUser(null);
          setForm({ username: "", email: "", role: "user", password: "" });
          setShowAddUserModal(true);
        }}
      />

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <UserModal
          darkMode={darkMode}
          editingUser={editingUser}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
            setForm({ username: "", email: "", role: "user", password: "" });
          }}
        />
      )}

      {/* Users Grid/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u, index) => (
            <UserCard
              key={u.id}
              darkMode={darkMode}
              user={u}
              index={index}
              onEdit={() => {
                handleEdit(u);
                setShowAddUserModal(true);
              }}
              onDelete={() => handleDelete(u.id)}
            />
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