import React from "react";
import { X, Edit2, Plus, UserCircle, Mail, Shield } from "lucide-react";

function UserModal({ darkMode, editingUser, form, setForm, onSubmit, onClose }) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
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
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
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
              onClick={onClose}
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
  );
}

export default UserModal;
