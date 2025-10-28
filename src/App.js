import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import UserPage from "./pages/UserPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import "./styles.css";

// ✅ Main App component
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* User-specific page */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserPage />
            </ProtectedRoute>
          }
        />

        {/* Analytics – only admins */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// ✅ Root wrapper
const RootApp = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <App />
    </div>
  );
};

// ✅ Final export
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
