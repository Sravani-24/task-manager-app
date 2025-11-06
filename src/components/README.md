# Components Directory Structure

This directory contains all reusable React components, organized by purpose:

## 📂 Folder Structure

### `common/`
Reusable UI components used across the application:
- **ConfirmDialog.jsx** - Confirmation modal for destructive actions
- **NotificationPopup.jsx** - Toast-style notifications (success, error, warning, info)
- **DataBackup.jsx** - Import/Export backup functionality
- **MultiSelectDropdown.jsx** - Multi-select dropdown with checkboxes

### `layout/`
Navigation and layout components:
- **Navbar.jsx** - Main navigation bar with theme toggle and user menu

### `tasks/`
Task management page components:
- **TasksHeader.jsx** - Page header with Import/Export and Cleanup buttons
- **TaskSearchBar.jsx** - Search input and New Task button
- **TaskFilters.jsx** - Status, Type, Priority, and User filters
- **TaskList.jsx** - Grid of task cards with edit/delete/comment actions
- **CommentsModal.jsx** - Modal for viewing and adding task comments
- **TaskDetailsModal.jsx** - Full task details view modal
- **TaskCard.jsx** - Legacy simple task card component (unused)
- **TaskForm.jsx** - Legacy simple task form component (unused)

## 🔄 Import Paths

```javascript
// Common components
import ConfirmDialog from "../../components/common/ConfirmDialog";
import NotificationPopup from "../../components/common/NotificationPopup";
import DataBackup from "../../components/common/DataBackup";
import MultiSelectDropdown from "../../components/common/MultiSelectDropdown";

// Layout components
import Navbar from "./components/layout/Navbar";

// Task components
import TasksHeader from "../../components/tasks/TasksHeader";
import TaskSearchBar from "../../components/tasks/TaskSearchBar";
import TaskFilters from "../../components/tasks/TaskFilters";
import TaskList from "../../components/tasks/TaskList";
import CommentsModal from "../../components/tasks/CommentsModal";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
```

## 📝 Notes

- All imports have been updated to reflect the new structure
- Legacy components (TaskCard, TaskForm) are kept in `tasks/` folder but not currently used
- Dark mode support is implemented via props across all components
