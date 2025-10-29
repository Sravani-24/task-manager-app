import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Theme context

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme(); // Access theme state

  const handleLogout = () => {
    logout();           // Clear user session
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className={`p-4 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-slate-50 text-slate-800 border-b border-slate-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-bold text-lg whitespace-nowrap">Task Manager</h1>
        <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-1 rounded 
            ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-medium truncate max-w-[30vw] sm:max-w-none hidden sm:inline">{user.username || user.name}</span>
            <button
              onClick={handleLogout}
              className={`${darkMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-rose-200 hover:bg-rose-300 text-rose-900"} px-4 py-2 md:px-3 md:py-1 rounded transition`}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="px-3 py-2 hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className={`${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-sky-200 hover:bg-sky-300 text-sky-900"} px-4 py-2 md:px-3 md:py-1 rounded transition text-center`}
            >
              Register
            </Link>
          </div>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
