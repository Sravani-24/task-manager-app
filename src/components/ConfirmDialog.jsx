import React from "react";
import { AlertTriangle, X } from "lucide-react";

function ConfirmDialog({ message, onConfirm, onCancel, darkMode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div
        className={`relative max-w-md w-full mx-4 p-6 rounded-lg shadow-2xl ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        } animate-scaleIn`}
      >
        <button
          onClick={onCancel}
          className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
