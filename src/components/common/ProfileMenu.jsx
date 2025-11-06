import React, { useEffect, useRef, useState } from "react";
import { User as UserIcon, LogOut, KeyRound, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { auth } from "../../firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import NotificationPopup from "./NotificationPopup";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();

  const [open, setOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const validateReset = () => {
    if (!email || !email.includes("@")) return "Please enter a valid email";
    if (!currentPassword) return "Please enter your current password";
    if (!newPassword || newPassword.length < 6) return "New password must be at least 6 characters";
    if (newPassword !== confirmPassword) return "New passwords do not match";
    return null;
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault?.();
    const error = validateReset();
    if (error) {
      setNotification({ message: error, type: "warning" });
      return;
    }
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user found");

      // Reauthenticate
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setShowReset(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotification({ message: "Password updated successfully.", type: "success" });
    } catch (err) {
      console.error("Reset password error:", err);
      let msg = err?.message || "Failed to reset password";
      if (msg.includes("auth/wrong-password")) msg = "Current password is incorrect";
      if (msg.includes("auth/too-many-requests")) msg = "Too many attempts. Try again later.";
      setNotification({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar / Profile Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm border transition-colors ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Open profile menu"
      >
        {user?.username ? (
          <span className="font-semibold">{user.username.charAt(0).toUpperCase()}</span>
        ) : (
          <UserIcon size={18} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg overflow-hidden z-20 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          }`}
        >
          <button
            onClick={() => {
              setShowReset(true);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-blue-50 ${
              darkMode ? "hover:bg-gray-700 text-gray-100" : "text-gray-700"
            }`}
          >
            <KeyRound size={16} /> Reset password
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-rose-50 ${
              darkMode ? "hover:bg-gray-700 text-gray-100" : "text-gray-700"
            }`}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-md mx-4 rounded-2xl p-6 shadow-xl ${
              darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reset password</h3>
              <button
                onClick={() => setShowReset(false)}
                className={`p-2 rounded ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className={`${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} px-4 py-2 rounded-lg`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    loading
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  } ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white px-4 py-2 rounded-lg font-semibold`}
                >
                  {loading ? "Saving..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          darkMode={darkMode}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
