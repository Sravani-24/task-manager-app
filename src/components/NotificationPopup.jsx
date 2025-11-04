import React from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

function NotificationPopup({ message, type = "info", onClose, darkMode }) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "warning":
        return "border-yellow-500";
      default:
        return "border-blue-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div
        className={`relative max-w-md w-full mx-4 p-6 rounded-lg shadow-2xl border-l-4 ${getBorderColor()} ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        } animate-scaleIn`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getIcon()}</div>
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === "success"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : type === "error"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : type === "warning"
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPopup;
