import React from "react";
import MultiSelectDropdown from "../common/MultiSelectDropdown";

function TaskEditorModal({
  darkMode,
  editingId,
  form,
  setForm,
  usersList,
  teamsList,
  userRole,
  today,
  onSubmit,
  onCancel,
  onConfirmPastDate,
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (selectedDate && selectedDate < todayStr) {
      onConfirmPastDate(selectedDate);
    } else {
      setForm({ ...form, dueDate: selectedDate });
    }
  };

  const isAdmin = userRole === "admin";
  const isNewTask = editingId === "new";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className={`p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}>
        <h3 className="text-xl font-semibold mb-4">
          {isNewTask ? "New Task" : "Edit Task"}
        </h3>
        
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {/* Title - Admin only for new tasks, editable for admins editing */}
          {(isAdmin || !isNewTask) && (
            <input
              type="text"
              placeholder="Task Title"
              required
              className={`w-full border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={!isAdmin && !isNewTask}
            />
          )}

          {/* Description - Admin only for new tasks */}
          {(isAdmin || !isNewTask) && (
            <textarea
              placeholder="Task Description"
              rows="3"
              className={`w-full border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={!isAdmin && !isNewTask}
            />
          )}

          {/* Task Type Selection - Admin only for new tasks */}
          {isAdmin && isNewTask && (
            <div>
              <label className="block text-sm font-medium mb-2">Task Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, taskType: "individual", selectedTeam: null })}
                  className={`px-4 py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                    form.taskType === "individual"
                      ? darkMode
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-blue-500 border-blue-500 text-white"
                      : darkMode
                      ? "border-gray-600 text-gray-300 hover:border-blue-500"
                      : "border-gray-300 text-gray-700 hover:border-blue-500"
                  }`}
                >
                  👤 Individual
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, taskType: "group", assignedTo: [] })}
                  className={`px-4 py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                    form.taskType === "group"
                      ? darkMode
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-purple-500 border-purple-500 text-white"
                      : darkMode
                      ? "border-gray-600 text-gray-300 hover:border-purple-500"
                      : "border-gray-300 text-gray-700 hover:border-purple-500"
                  }`}
                >
                  👥 Team
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, taskType: "custom", selectedTeam: null, assignedTo: [] })}
                  className={`px-4 py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                    form.taskType === "custom"
                      ? darkMode
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-green-500 border-green-500 text-white"
                      : darkMode
                      ? "border-gray-600 text-gray-300 hover:border-green-500"
                      : "border-gray-300 text-gray-700 hover:border-green-500"
                  }`}
                >
                  ⚙️ Custom
                </button>
              </div>
            </div>
          )}

          {/* Assign Users - Admin only - Show for Individual Task, Custom Task, or when editing */}
          {isAdmin && (!isNewTask || form.taskType === "individual" || form.taskType === "custom") && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign User
                {form.taskType === "individual" && (
                  <span className="text-xs text-gray-400"> (select only one)</span>
                )}
                {form.taskType === "custom" && (
                  <span className="text-xs text-gray-400"> (select at least 2 users)</span>
                )}
              </label>
              <MultiSelectDropdown
                options={usersList
                  .filter((u) => u.role?.toLowerCase() !== "admin")
                  .map((u) => ({
                    id: u.id,
                    value: u.username,
                    label: u.name || u.username,
                  }))}
                selected={form.assignedTo || []}
                onChange={(selectedUsers) => {
                  // For individual tasks, only allow one user
                  if (form.taskType === "individual") {
                    setForm({ ...form, assignedTo: selectedUsers.slice(-1) });
                  } else {
                    setForm({ ...form, assignedTo: selectedUsers });
                  }
                }}
                placeholder={
                  form.taskType === "individual"
                    ? "Select one user to assign..."
                    : "Select users to assign..."
                }
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Select Team - Admin only - Show for Team Task */}
          {isAdmin && isNewTask && form.taskType === "group" && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Team</label>
              <select
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white border-gray-300"
                }`}
                value={form.selectedTeam || ""}
                onChange={(e) => setForm({ ...form, selectedTeam: e.target.value })}
                required
              >
                <option value="">Select a team...</option>
                {teamsList.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.members.length} members)
                  </option>
                ))}
              </select>
              {form.selectedTeam && (
                <div className={`mt-2 p-2 rounded text-xs ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                  <p className="font-semibold mb-1">Team Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {teamsList
                      .find((t) => t.id === parseInt(form.selectedTeam))
                      ?.members.map((member, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded ${
                            darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                          }`}
                        >
                          {member}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status - Everyone can edit */}
          <select
            className={`w-full border p-2 rounded ${
              darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
            }`}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          {/* Priority - Admin only */}
          {isAdmin && (
            <select
              className={`w-full border p-2 rounded ${
                darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
              }`}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          )}

          {/* Due Date - Admin only */}
          {isAdmin && (
            <div>
              <input
                type="date"
                min={today}
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={form.dueDate}
                onChange={handleDateChange}
              />
              {form.dueDate && form.dueDate < today && (
                <p className="text-xs text-red-500 mt-1">⚠️ This date is in the past</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {isNewTask ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={onCancel}
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

export default TaskEditorModal;
