import React from "react";
import { Mail, Shield, UserCircle, Edit2, Trash2 } from "lucide-react";

function UserCard({ darkMode, user, index, onEdit, onDelete }) {
  return (
    <div
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
          user.role === "admin" 
            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        }`}>
          {user.role === "admin" ? <Shield size={12} /> : <UserCircle size={12} />}
          {user.role?.toUpperCase()}
        </span>
      </div>

      {/* User Avatar */}
      <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl font-bold shadow-lg ${
        user.role === "admin"
          ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
      }`}>
        {user.username?.charAt(0).toUpperCase() || "U"}
      </div>

      {/* User Info */}
      <div className="mb-4">
        <h3 className={`text-lg font-bold mb-2 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}>
          {user.username}
        </h3>
        <div className={`flex items-center gap-2 text-sm ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}>
          <Mail size={14} />
          <span className="truncate">{user.email}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-2 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          onClick={onEdit}
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
          onClick={onDelete}
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
  );
}

export default UserCard;
