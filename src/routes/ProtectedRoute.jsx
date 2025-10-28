import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  // ✅ Not logged in → redirect to login
  if (!user) return <Navigate to="/" replace />;

  // ✅ If allowedRoles is given and user role not included → show restricted message
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-center text-xl font-semibold text-gray-600">
          🚫 Access Denied: This page is restricted to certain roles.
        </h1>
      </div>
    );
  }

  // ✅ Otherwise render the child component
  return children;
}
