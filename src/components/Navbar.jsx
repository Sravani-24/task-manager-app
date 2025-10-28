import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Theme context

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme(); // Access theme state

  const handleLogout = () => {
    logout();           // Clear user session
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className={`flex justify-between items-center p-4 
      ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"}`}>
      <h1 className="font-bold text-lg">Task Manager</h1>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-1 rounded 
            ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"}`}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        {user ? (
          <>
            {/* Display username */}
            <span className="font-medium">{user.username || user.name}</span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
