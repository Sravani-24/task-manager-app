import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Users, Plus, Edit2, Trash2, X, UserPlus, ChevronDown, ChevronUp } from "lucide-react";

function TeamsTab({ darkMode }) {
  const { user } = useAuth();
  const { tasks, addTask } = useTasks();
  const [teams, setTeams] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expandedTeamTasks, setExpandedTeamTasks] = useState({});
  
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    members: [],
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Low",
    dueDate: "",
  });

  const toggleTeamTasks = (teamId) => {
    setExpandedTeamTasks(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // Fetch teams from localStorage
  useEffect(() => {
    const loadTeams = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("teams")) || [];
        setTeams(saved);
      } catch (e) {
        console.error("Error loading teams:", e);
        setTeams([]);
      }
    };
    loadTeams();
  }, []);

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(usersRef);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsersList(list.filter((u) => u.role?.toLowerCase() !== "admin"));
      } catch (err) {
        console.error("Error loading users: ", err);
      }
    };
    fetchUsers();
  }, []);

  // Save teams to localStorage
  const saveTeams = (updatedTeams) => {
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
  };

  // Handle team creation/update
  const handleTeamSubmit = (e) => {
    e.preventDefault();
    
    if (!teamForm.name || teamForm.members.length === 0) {
      alert("Please provide team name and select at least one member");
      return;
    }

    if (editingTeam) {
      // Update existing team
      const updatedTeams = teams.map((t) =>
        t.id === editingTeam.id ? { ...teamForm, id: editingTeam.id } : t
      );
      saveTeams(updatedTeams);
      alert("Team updated successfully!");
    } else {
      // Create new team
      const newTeam = {
        ...teamForm,
        id: Date.now(),
        createdBy: user.username,
        createdAt: new Date().toISOString(),
      };
      saveTeams([...teams, newTeam]);
      alert("Team created successfully!");
    }

    setShowTeamModal(false);
    setEditingTeam(null);
    setTeamForm({ name: "", description: "", members: [] });
  };

  // Handle task assignment to team
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    
    if (!taskForm.title || !selectedTeam) {
      alert("Please provide task title");
      return;
    }

    // Create task assigned to all team members
    addTask({
      ...taskForm,
      assignedTo: selectedTeam.members,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      comments: [],
    });

    alert(`Task assigned to team "${selectedTeam.name}"!`);
    setShowTaskModal(false);
    setSelectedTeam(null);
    setTaskForm({
      title: "",
      description: "",
      status: "To Do",
      priority: "Low",
      dueDate: "",
    });
  };

  // Delete team
  const handleDeleteTeam = (teamId) => {
    if (!window.confirm("Delete this team? Tasks assigned to this team will remain.")) return;
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    saveTeams(updatedTeams);
  };

  // Edit team
  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description,
      members: team.members,
    });
    setShowTeamModal(true);
  };

  // Toggle member selection
  const toggleMember = (username) => {
    setTeamForm((prev) => ({
      ...prev,
      members: prev.members.includes(username)
        ? prev.members.filter((m) => m !== username)
        : [...prev.members, username],
    }));
  };

  // Get tasks for a specific team
  const getTeamTasks = (teamId) => {
    return tasks.filter((task) => task.teamId === teamId);
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  return (
    <>
      {/* Header Section */}
      <div className={`mb-6 p-6 rounded-2xl shadow-lg bg-gradient-to-br ${
        darkMode 
          ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
          : "from-blue-50 via-white to-purple-50 border border-blue-100"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              <Users className="inline-block mr-2 mb-1" size={28} />
              Teams & Groups
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Create and manage teams to collaborate on tasks
            </p>
          </div>
          <div className={`p-4 rounded-xl ${
            darkMode ? "bg-gray-700/50" : "bg-white/80"
          } shadow-sm`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {teams.length}
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Teams</p>
            </div>
          </div>
        </div>

        {user?.role?.toLowerCase() === "admin" && (
          <button
            onClick={() => {
              setEditingTeam(null);
              setTeamForm({ name: "", description: "", members: [] });
              setShowTeamModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Team
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className={`p-5 rounded-xl shadow-md border-l-4 border-l-blue-500 ${
                darkMode ? "bg-gradient-to-br from-blue-900/20 to-gray-900/60" : "bg-gradient-to-br from-blue-50 to-white"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                    {team.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {team.description || "No description"}
                  </p>
                </div>
              </div>

              {/* Members */}
              <div className="mb-3">
                <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Members ({team.members.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        darkMode ? "bg-blue-600 text-blue-100" : "bg-blue-500 text-white"
                      }`}
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Tasks Count */}
              <div className={`mb-3 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-gray-100"}`}>
                <button
                  onClick={() => toggleTeamTasks(team.id)}
                  className={`w-full p-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition-all ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  } rounded-lg`}
                >
                  <p className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    📋 Team Tasks
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {getTeamTasks(team.id).length}
                    </span>
                    {expandedTeamTasks[team.id] ? (
                      <ChevronUp size={16} className={darkMode ? "text-gray-400" : "text-gray-600"} />
                    ) : (
                      <ChevronDown size={16} className={darkMode ? "text-gray-400" : "text-gray-600"} />
                    )}
                  </div>
                </button>
                
                {expandedTeamTasks[team.id] && (
                  <div className="px-3 pb-3">
                    {getTeamTasks(team.id).length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                        {getTeamTasks(team.id).map((task) => (
                          <div 
                            key={task.id}
                            className={`p-2 rounded text-xs ${
                              darkMode ? "bg-gray-900/50" : "bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`font-medium flex-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {task.title}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                                task.status === "Done"
                                  ? "bg-green-500 text-white"
                                  : task.status === "In Progress"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}>
                                {task.status}
                              </span>
                            </div>
                            {task.priority && (
                              <span className={`text-[10px] ${
                                task.priority === "High"
                                  ? "text-red-400"
                                  : task.priority === "Medium"
                                  ? "text-yellow-400"
                                  : "text-blue-400"
                              }`}>
                                {task.priority} Priority
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        No tasks assigned yet
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTeam(team);
                    setShowTaskModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  <UserPlus size={14} className="inline mr-1" />
                  Assign Task
                </button>
                {user?.role?.toLowerCase() === "admin" && (
                  <>
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className={`inline-block p-8 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <p className="text-6xl mb-4">👥</p>
              <p className="text-xl font-semibold mb-2">No teams yet</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Create a team to start collaborating!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className={`p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {editingTeam ? "Edit Team" : "Create New Team"}
              </h3>
              <button
                onClick={() => {
                  setShowTeamModal(false);
                  setEditingTeam(null);
                  setTeamForm({ name: "", description: "", members: [] });
                }}
                className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTeamSubmit} className="space-y-4">
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
                          onChange={() => toggleMember(u.username)}
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
                  onClick={() => {
                    setShowTeamModal(false);
                    setEditingTeam(null);
                    setTeamForm({ name: "", description: "", members: [] });
                  }}
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
      )}

      {/* Assign Task to Team Modal */}
      {showTaskModal && selectedTeam && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className={`p-6 rounded-lg w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Assign Task to "{selectedTeam.name}"
              </h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTeam(null);
                  setTaskForm({
                    title: "",
                    description: "",
                    status: "To Do",
                    priority: "Low",
                    dueDate: "",
                  });
                }}
                className={`p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Task Title"
                required
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />

              <textarea
                placeholder="Task Description"
                rows="3"
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />

              <select
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>

              <select
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <input
                type="date"
                min={today}
                className={`w-full border p-2 rounded ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-white"
                }`}
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />

              <div className={`p-3 rounded ${darkMode ? "bg-gray-700/50" : "bg-blue-50"}`}>
                <p className="text-sm font-semibold mb-1">Task will be assigned to:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTeam.members.map((member, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs ${
                        darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      }`}
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Assign Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setSelectedTeam(null);
                    setTaskForm({
                      title: "",
                      description: "",
                      status: "To Do",
                      priority: "Low",
                      dueDate: "",
                    });
                  }}
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
      )}
    </>
  );
}

export default TeamsTab;
