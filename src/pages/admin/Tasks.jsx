import React, { useState, useEffect } from "react";
import NotificationPopup from "../../components/common/NotificationPopup";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DataBackup from "../../components/common/DataBackup";
import TasksHeader from "../../components/tasks/TasksHeader";
import TaskSearchBar from "../../components/tasks/TaskSearchBar";
import TaskFilters from "../../components/tasks/TaskFilters";
import TaskList from "../../components/tasks/TaskList";
import CommentsModal from "../../components/tasks/CommentsModal";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import TaskEditorModal from "../../components/tasks/TaskEditorModal";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs} from "firebase/firestore";

function TasksTab({ darkMode, addActivityLog }) {
  const { user } = useAuth();
  const { tasks = [], addTask, updateTask, deleteTask, addComment } = useTasks();

  const [usersList, setUsersList] = useState([]); // Firebase user list
  const [teamsList, setTeamsList] = useState([]); // Teams list
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: [], 
    status: "To Do",
    priority: "Low",
    dueDate: "",
    taskType: "individual",
    selectedTeam: null,
  });

  const [editingId, setEditingId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentModalTask, setCommentModalTask] = useState(null);
  
  // Notification and Confirmation states
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  
  // Bulk selection
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All Priority");
  const [filterUser, setFilterUser] = useState("All Users");
  const [filterType, setFilterType] = useState("All Tasks");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 9;

  const safeTasks = tasks || [];
  const visibleTasks =
    user?.role?.toLowerCase() === "admin"
      ? safeTasks
      : safeTasks.filter((t) => {
          // Handle both array (new format) and string (legacy format) for assignedTo
          if (Array.isArray(t.assignedTo)) {
            return t.assignedTo.some(
              (assignee) => assignee?.toLowerCase() === user?.username?.toLowerCase()
            );
          }
          return t.assignedTo?.toLowerCase() === user?.username?.toLowerCase();
        });
        
  // Apply filters
  const filteredTasks = visibleTasks.filter(task => {
    // Determine overdue status (incomplete tasks with past due date)
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = !!task.dueDate && task.status !== "Done" && task.dueDate < todayStr;

    // If a specific status is selected (e.g., To Do / In Progress), exclude overdue
    const statusMatch =
      filterStatus === "All"
        ? true
        : filterStatus === "Overdue"
        ? isOverdue
        : task.status === filterStatus && !isOverdue;
    const priorityMatch = filterPriority === "All Priority" || task.priority === filterPriority;
    
    // Handle both array and string for assignedTo
    let userMatch = filterUser === "All Users";
    if (!userMatch) {
      if (Array.isArray(task.assignedTo)) {
        userMatch = task.assignedTo.includes(filterUser);
      } else {
        userMatch = task.assignedTo === filterUser;
      }
    }
    
    // Task type filter (individual vs team vs custom)
    let typeMatch = filterType === "All Tasks";
    if (!typeMatch) {
      if (filterType === "Individual Task") {
        // Individual task: assigned to only 1 person
        typeMatch = Array.isArray(task.assignedTo) ? task.assignedTo.length === 1 : true;
      } else if (filterType === "Team Task") {
        // Team task: assigned to multiple people with a team
        typeMatch = Array.isArray(task.assignedTo) && task.assignedTo.length > 1 && task.teamName;
      } else if (filterType === "Custom Task") {
        // Custom task: assigned to multiple people without a team
        typeMatch = Array.isArray(task.assignedTo) && task.assignedTo.length > 1 && !task.teamName;
      }
    }
    
    // Search by task title or description
    const searchMatch = searchQuery.trim() === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && priorityMatch && userMatch && typeMatch && searchMatch;
  });

  // Clear selection when filters/search/page change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filterStatus, filterPriority, filterUser, filterType, searchQuery, currentPage]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    // Select only tasks visible on the current page
    setSelectedIds(new Set(currentTasks.map(t => t.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdateStatus = (status) => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      message: `Set status to "${status}" for ${selectedIds.size} selected task(s)?`,
      onConfirm: () => {
        selectedIds.forEach(id => updateTask(id, { status }));
        setNotification({ message: `Updated status for ${selectedIds.size} task(s).`, type: 'success' });
        setSelectedIds(new Set());
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const bulkUpdatePriority = (priority) => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      message: `Set priority to "${priority}" for ${selectedIds.size} selected task(s)?`,
      onConfirm: () => {
        selectedIds.forEach(id => updateTask(id, { priority }));
        setNotification({ message: `Updated priority for ${selectedIds.size} task(s).`, type: 'success' });
        setSelectedIds(new Set());
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      message: `Delete ${selectedIds.size} selected task(s)? This cannot be undone.`,
      onConfirm: () => {
        selectedIds.forEach(id => deleteTask(id));
        setSelectedIds(new Set());
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, filterUser, filterType, searchQuery]);

  /* ✅ Fetch users from Firebase */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(usersRef);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsersList(list);
      } catch (err) {
        console.error("Error loading users: ", err);
      }
    };

    fetchUsers();
  }, []);

  // Fetch teams from localStorage
  useEffect(() => {
    const loadTeams = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("teams")) || [];
        setTeamsList(saved);
      } catch (e) {
        console.error("Error loading teams:", e);
        setTeamsList([]);
      }
    };
    loadTeams();
  }, []);

  // Function to clean up orphaned tasks
  const cleanupOrphanedTasks = () => {
    try {
      // Read directly from localStorage
      const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      console.log("All tasks before cleanup:", storedTasks);
      
      const teamIds = new Set(teamsList.map(t => t.id));
      console.log("Valid team IDs:", Array.from(teamIds));
      
      let cleanedCount = 0;
      
      // Update tasks in localStorage
      const updatedTasks = storedTasks.map(task => {
        console.log(`Checking task "${task.title}": teamId=${task.teamId}, teamName=${task.teamName}`);
        
        if (task.teamId && !teamIds.has(task.teamId)) {
          console.log(`✅ CLEANING: "${task.title}" - Team "${task.teamName}" (ID: ${task.teamId}) no longer exists`);
          cleanedCount++;
          const cleanedTask = { ...task };
          delete cleanedTask.teamId;
          delete cleanedTask.teamName;
          console.log("Cleaned task:", cleanedTask);
          return cleanedTask;
        }
        return task;
      });
      
      console.log("Tasks after cleanup:", updatedTasks);
      
      // Save back to localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      
      if (cleanedCount > 0) {
        setNotification({
          message: `Converted ${cleanedCount} orphaned task(s) to custom tasks. Refreshing page...`,
          type: "success",
          onClose: () => window.location.reload()
        });
      } else {
        setNotification({
          message: "No orphaned tasks found. Check console for details.",
          type: "info"
        });
      }
    } catch (error) {
      console.error("Error cleaning up orphaned tasks:", error);
      setNotification({
        message: "Error cleaning up tasks. Check console for details.",
        type: "error"
      });
    }
  };

  // Auto cleanup on load and when teams change
  useEffect(() => {
    if (tasks.length === 0 || !teamsList) return;
    
    const teamIds = new Set(teamsList.map(t => t.id));
    
    tasks.forEach(task => {
      if (task.teamId && !teamIds.has(task.teamId)) {
        console.log(`Auto-converting orphaned task "${task.title}" (teamId: ${task.teamId}, teamName: ${task.teamName}) to custom task`);
        const updatedTask = { ...task };
        delete updatedTask.teamId;
        delete updatedTask.teamName;
        updateTask(task.id, updatedTask, { silent: true, actor: "system" });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsList]);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Validate all required fields
    if (!form.title || !form.title.trim()) {
      setNotification({
        message: "Title is required",
        type: "warning"
      });
      return;
    }

    if (!form.description || !form.description.trim()) {
      setNotification({
        message: "Description is required",
        type: "warning"
      });
      return;
    }

    if (!form.priority) {
      setNotification({
        message: "Priority is required",
        type: "warning"
      });
      return;
    }

    if (!form.status) {
      setNotification({
        message: "Status is required",
        type: "warning"
      });
      return;
    }

    if (!form.dueDate || !form.dueDate.trim()) {
      setNotification({
        message: "Due date is required",
        type: "warning"
      });
      return;
    }

    // For group tasks, get team members
    let assignedUsers = form.assignedTo;
    let teamInfo = {};
    
    if (form.taskType === "group" && form.selectedTeam) {
      const team = teamsList.find(t => t.id === parseInt(form.selectedTeam));
      if (team) {
        assignedUsers = team.members;
        teamInfo = {
          teamId: team.id,
          teamName: team.name,
        };
      }
    }
    // For individual tasks, enforce single user constraint
    else if (form.taskType === "individual") {
      assignedUsers = form.assignedTo;
      if (assignedUsers.length !== 1) {
        setNotification({
          message: "Individual tasks must be assigned to exactly one user.",
          type: "warning"
        });
        return;
      }
    }
    // For custom tasks, use the manually selected users
    else if (form.taskType === "custom") {
      assignedUsers = form.assignedTo;
      // Validate that at least 2 users are selected for custom tasks
      if (assignedUsers.length < 2) {
        setNotification({
          message: "Custom tasks require at least 2 users. Please select at least 2 users.",
          type: "warning"
        });
        return;
      }
      // No team info for custom tasks
    }

    if (!assignedUsers || assignedUsers.length === 0) {
      setNotification({
        message: "Please assign users or select a team",
        type: "warning"
      });
      return;
    }

    const normalizedStatus =
      form.status.toLowerCase() === "completed" ? "Done" : form.status;

    if (editingId && editingId !== "new") {
      // Update existing task
      console.log("✏️ Updating existing task:", editingId);
      updateTask(editingId, { 
        ...form, 
        status: normalizedStatus,
        assignedTo: assignedUsers,
        ...teamInfo,
      });
    } else {
      // Create new task (local storage)
      console.log("📝 Creating new task with form data:", form);
      addTask({
        ...form,
        assignedTo: assignedUsers,
        ...teamInfo,
        comments: [],
        status: normalizedStatus,
      });
    }

    // Reset form and close modal
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      assignedTo: [],
      status: "To Do",
      priority: "Low",
      dueDate: "",
      taskType: "individual",
      selectedTeam: null,
    });
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  return (
    <>
      {/* Unified Header and Filter Section */}
      <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-2xl shadow-lg bg-gradient-to-br ${
        darkMode 
          ? "from-blue-900/20 via-gray-800 to-purple-900/20 border border-gray-700" 
          : "from-blue-100/50 via-indigo-50/30 to-purple-100/50 border border-blue-200/50"
      }`}>
        {/* Header with Title and Stats */}
        <TasksHeader
          darkMode={darkMode}
          isAdmin={user?.role?.toLowerCase() === "admin"}
          totalVisible={visibleTasks.length}
          onOpenBackup={() => setShowBackupModal(true)}
          onRequestCleanup={() =>
            setConfirmDialog({
              message:
                "Cleanup will scan all tasks and convert any task linked to a deleted/missing team into a Custom task. This removes only the team link (teamId/teamName) and keeps the task, assignees, and content unchanged.",
              onConfirm: () => {
                cleanupOrphanedTasks();
                setConfirmDialog(null);
              },
              onCancel: () => setConfirmDialog(null),
            })
          }
        />

        {/* Search Bar with New Task Button */}
        <TaskSearchBar
          darkMode={darkMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdmin={user?.role?.toLowerCase() === "admin"}
          onCreateNew={() => {
            setEditingId("new");
            setForm({
              title: "",
              description: "",
              assignedTo: [],
              status: "To Do",
              priority: "Low",
              dueDate: "",
              taskType: "individual",
              selectedTeam: null,
            });
          }}
          extraRight={
            user?.role?.toLowerCase() === "admin" ? (
              <button
                onClick={() => { setBulkMode(v => !v); setSelectedIds(new Set()); }}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap`}
              >
                {bulkMode ? 'Exit bulk select' : 'Bulk select'}
              </button>
            ) : null
          }
        />

        {/* Filters */}
        <TaskFilters
          darkMode={darkMode}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterUser={filterUser}
          setFilterUser={setFilterUser}
          usersList={usersList}
        />
      </div>

      {/* Task Creation/Edit Modal */}
      {editingId && (
        <TaskEditorModal
          darkMode={darkMode}
          editingId={editingId}
          form={form}
          setForm={setForm}
          usersList={usersList}
          teamsList={teamsList}
          userRole={user?.role?.toLowerCase()}
          today={today}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingId(null);
            setForm({
              title: "",
              description: "",
              assignedTo: [],
              status: "To Do",
              priority: "Low",
              dueDate: "",
              taskType: "individual",
              selectedTeam: null,
            });
          }}
          onConfirmPastDate={(selectedDate) => {
            setConfirmDialog({
              message: "The selected due date is in the past. Are you sure you want to continue?",
              onConfirm: () => {
                setForm({ ...form, dueDate: selectedDate });
                setConfirmDialog(null);
              },
              onCancel: () => setConfirmDialog(null)
            });
          }}
        />
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl relative">
            <button
              onClick={() => setShowBackupModal(false)}
              className={`absolute -top-3 -right-3 rounded-full px-3 py-1 text-sm font-semibold shadow ${
                darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
              }`}
              aria-label="Close backup dialog"
            >
              ✕
            </button>
            <DataBackup darkMode={darkMode} />
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="mb-4">
          {/* Lazy import to avoid circular deps is not necessary here */}
          {React.createElement(require('../../components/tasks/BulkActionsBar').default, {
            darkMode,
            selectedCount: selectedIds.size,
            totalCount: currentTasks.length,
            onSelectAll: selectAll,
            onClear: clearSelection,
            onBulkStatus: bulkUpdateStatus,
            onBulkPriority: bulkUpdatePriority,
            onBulkDelete: bulkDelete,
          })}
        </div>
      )}

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <TaskList
          darkMode={darkMode}
          tasks={currentTasks}
          userRole={user?.role?.toLowerCase()}
          bulkMode={bulkMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onEdit={(task) => {
            let assignedToArray = [];
            if (Array.isArray(task.assignedTo)) {
              assignedToArray = task.assignedTo;
            } else if (task.assignedTo && typeof task.assignedTo === "string") {
              assignedToArray = task.assignedTo.includes(",")
                ? task.assignedTo.split(",").map((u) => u.trim())
                : [task.assignedTo];
            }
            let taskType = "individual";
            if (task.teamId && task.teamName) taskType = "group";
            else if (assignedToArray.length > 1) taskType = "custom";
            setForm({ ...task, assignedTo: assignedToArray, taskType });
            setEditingId(task.id);
          }}
          onDelete={(id) =>
            setConfirmDialog({
              message: "Delete this task? This cannot be undone.",
              onConfirm: () => {
                deleteTask(id);
                setConfirmDialog(null);
              },
              onCancel: () => setConfirmDialog(null),
            })
          }
          onOpenComments={(task) => setCommentModalTask(task)}
          onSelectTask={(task) => setSelectedTask(task)}
        />
      </div>

      {/* Pagination Controls */}
      {filteredTasks.length > 0 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 mb-8 p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNumber
                          ? darkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                // Show ellipsis
                if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return (
                    <span key={pageNumber} className={`px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? darkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ✅ Comments Modal */}
      {commentModalTask && (
        <CommentsModal
          darkMode={darkMode}
          task={commentModalTask}
          commentInput={commentInput}
          onChangeInput={setCommentInput}
          onAdd={() => {
            if (!commentInput.trim()) return;
            const newComment = { id: Date.now(), text: commentInput, author: user.username, time: new Date().toISOString() };
            addComment(commentModalTask.id, newComment);
            setCommentInput("");
            setCommentModalTask((prev) => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
          }}
          onClose={() => setCommentModalTask(null)}
        />
      )}

      {/* ✅ Full Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal darkMode={darkMode} task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* Notification Popup */}
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          darkMode={darkMode}
          onClose={() => {
            if (notification.onClose) {
              notification.onClose();
            }
            setNotification(null);
          }}
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
export default TasksTab;