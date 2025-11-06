import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";

import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analytics from "./pages/admin/Analytics";
import UserPage from "./pages/user/UserPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import "./styles.css";

// Main App component
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Wrap to apply Theme & Background
const RootApp = () => {
  const { darkMode } = useTheme();

  React.useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#0f172a" : "#f8fafc";
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <App />
    </div>
  );
};

// Root export
const MainApp = () => (
  <ThemeProvider>
    <AuthProvider>
      <TaskProvider>
        <RootApp />
      </TaskProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default MainApp;
