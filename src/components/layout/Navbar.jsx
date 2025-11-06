import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; 
import ProfileMenu from "../common/ProfileMenu";

const Navbar = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme(); 


  return (
    <nav key={darkMode ? "dark" : "light"} className={`p-3 sm:p-4 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-slate-50 text-slate-800 border-b border-slate-200"}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h1 className="font-bold text-base sm:text-lg whitespace-nowrap">TeamTrack</h1>
        <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-sm
            ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light" : "Dark"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none hidden xs:inline">{user.username || user.name}</span>
            <ProfileMenu />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="px-2 py-1 sm:px-3 sm:py-2 hover:underline text-xs sm:text-sm">
              Login
            </Link>
            <Link
              to="/register"
              className={`${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-sky-200 hover:bg-sky-300 text-sky-900"} px-3 py-1.5 sm:px-4 sm:py-2 rounded transition text-center text-xs sm:text-sm font-medium`}
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
