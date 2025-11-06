import React from "react";
import { X } from "lucide-react";

function TeamModal({ darkMode, editingTeam, teamForm, setTeamForm, usersList, onSubmit, onClose, onToggleMember }) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className={`p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {editingTeam ? "Edit Team" : "Create New Team"}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name *</label>
            <input
              type="text"
              placeholder="Enter team name"
              required
              className={`w-full border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white border-gray-300"
              }`}
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              placeholder="Team description (optional)"
              rows="3"
              className={`w-full border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white border-gray-300"
              }`}
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Members * ({teamForm.members.length} selected)
            </label>
            <div className={`border rounded p-3 max-h-48 overflow-y-auto ${
              darkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-300 bg-gray-50"
            }`}>
              {usersList.length > 0 ? (
                usersList.map((u) => (
                  <label
                    key={u.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                      darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={teamForm.members.includes(u.username)}
                      onChange={() => onToggleMember(u.username)}
                      className="w-4 h-4"
                    />
                    <span>{u.name || u.username}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No users available</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold"
            >
              {editingTeam ? "Update Team" : "Create Team"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md border ${
                darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeamModal;
