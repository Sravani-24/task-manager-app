import React, { useState, useEffect } from "react";
import NotificationPopup from "../../components/common/NotificationPopup";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TeamsHeader from "../../components/teams/TeamsHeader";
import TeamCard from "../../components/teams/TeamCard";
import TeamModal from "../../components/teams/TeamModal";
import TaskAssignmentModal from "../../components/teams/TaskAssignmentModal";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function TeamsTab({ darkMode }) {
  const { user } = useAuth();
  const { tasks, addTask, updateTask } = useTasks();
  const [teams, setTeams] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expandedTeamTasks, setExpandedTeamTasks] = useState({});
  
  // Notification and Confirmation states
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
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
      setNotification({
        message: "Please provide team name and select at least one member",
        type: "warning"
      });
      return;
    }

    // Check for duplicate team names
    const isDuplicate = teams.some((t) => 
      t.name.toLowerCase() === teamForm.name.toLowerCase() && 
      (!editingTeam || t.id !== editingTeam.id)
    );
    
    if (isDuplicate) {
      setNotification({
        message: "A team with this name already exists. Please choose a different name.",
        type: "warning"
      });
      return;
    }

    if (editingTeam) {
      // Update existing team
      const updatedTeams = teams.map((t) =>
        t.id === editingTeam.id ? { ...teamForm, id: editingTeam.id } : t
      );
      saveTeams(updatedTeams);
      setNotification({
        message: "Team updated successfully!",
        type: "success"
      });
    } else {
      // Create new team
      const newTeam = {
        ...teamForm,
        id: Date.now(),
        createdBy: user.username,
        createdAt: new Date().toISOString(),
      };
      saveTeams([...teams, newTeam]);
      setNotification({
        message: "Team created successfully!",
        type: "success"
      });
    }

    setShowTeamModal(false);
    setEditingTeam(null);
    setTeamForm({ name: "", description: "", members: [] });
  };

  // Handle task assignment to team
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    
    if (!taskForm.title || !selectedTeam) {
      setNotification({
        message: "Please provide task title",
        type: "warning"
      });
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

    setNotification({
      message: `Task assigned to team "${selectedTeam.name}"!`,
      type: "success"
    });
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
    setConfirmDialog({
      message: "Delete this team? Associated tasks will be converted to custom tasks.",
      onConfirm: () => {
        performDeleteTeam(teamId);
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const performDeleteTeam = (teamId) => {
    
    // Find all tasks associated with this team
    const teamTasks = tasks.filter((task) => task.teamId === teamId);
    
    // Convert team tasks to custom tasks (remove teamId and teamName, keep assignedTo)
      teamTasks.forEach((task) => {
        const updatedTask = { ...task };
        delete updatedTask.teamId;
        delete updatedTask.teamName;
        updateTask(task.id, updatedTask, { silent: true, actor: "system" });
    });
    
    // Delete the team
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
      <TeamsHeader
        darkMode={darkMode}
        teamsCount={teams.length}
        isAdmin={user?.role?.toLowerCase() === "admin"}
        onCreateTeam={() => {
          setEditingTeam(null);
          setTeamForm({ name: "", description: "", members: [] });
          setShowTeamModal(true);
        }}
      />

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
        {teams.length > 0 ? (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              darkMode={darkMode}
              team={team}
              isAdmin={user?.role?.toLowerCase() === "admin"}
              expandedTasks={expandedTeamTasks[team.id]}
              teamTasks={getTeamTasks(team.id)}
              onToggleTasks={() => toggleTeamTasks(team.id)}
              onAssignTask={() => {
                setSelectedTeam(team);
                setShowTaskModal(true);
              }}
              onEdit={() => handleEditTeam(team)}
              onDelete={() => handleDeleteTeam(team.id)}
            />
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
        <TeamModal
          darkMode={darkMode}
          editingTeam={editingTeam}
          teamForm={teamForm}
          setTeamForm={setTeamForm}
          usersList={usersList}
          onSubmit={handleTeamSubmit}
          onClose={() => {
            setShowTeamModal(false);
            setEditingTeam(null);
            setTeamForm({ name: "", description: "", members: [] });
          }}
          onToggleMember={toggleMember}
        />
      )}

      {/* Assign Task to Team Modal */}
      {showTaskModal && selectedTeam && (
        <TaskAssignmentModal
          darkMode={darkMode}
          selectedTeam={selectedTeam}
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          today={today}
          onSubmit={handleTaskSubmit}
          onClose={() => {
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
        />
      )}

      {/* Notification Popup */}
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          darkMode={darkMode}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          darkMode={darkMode}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </>
  );
}

export default TeamsTab;
