import React from "react";
import { Users, Shield, UserCircle, Plus, Search } from "lucide-react";

function UsersHeader({ darkMode, usersCount, adminsCount, searchQuery, setSearchQuery, roleFilter, setRoleFilter, onAddUser }) {
  return (
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
              {usersCount}
            </p>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Users</p>
          </div>
          <div className="text-center border-l pl-4">
            <p className={`text-2xl font-bold ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
              {adminsCount}
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
          onClick={onAddUser}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>
    </div>
  );
}

export default UsersHeader;
