import React from "react";
import { Download, Upload } from "lucide-react";

function DataBackup({ darkMode }) {
  const exportData = () => {
    try {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const teams = JSON.parse(localStorage.getItem("teams")) || [];
      const activityLog = JSON.parse(localStorage.getItem("activityLog")) || [];
      
      const backupData = {
        tasks,
        teams,
        activityLog,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert("✅ Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ Failed to export data: " + error.message);
    }
  };
  
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        if (!backupData.tasks || !Array.isArray(backupData.tasks)) {
          throw new Error("Invalid backup file format");
        }
        
        const confirmImport = window.confirm(
          `Import backup from ${backupData.exportDate || 'unknown date'}?\n` +
          `This will restore:\n` +
          `- ${backupData.tasks.length} tasks\n` +
          `- ${backupData.teams?.length || 0} teams\n` +
          `- ${backupData.activityLog?.length || 0} activity log entries\n\n` +
          `Current data will be replaced. Continue?`
        );
        
        if (!confirmImport) return;
        
        localStorage.setItem("tasks", JSON.stringify(backupData.tasks));
        if (backupData.teams) {
          localStorage.setItem("teams", JSON.stringify(backupData.teams));
        }
        if (backupData.activityLog) {
          localStorage.setItem("activityLog", JSON.stringify(backupData.activityLog));
        }
        
        alert("✅ Data imported successfully! Refreshing page...");
        window.location.reload();
      } catch (error) {
        console.error("Import error:", error);
        alert("❌ Failed to import data: " + error.message);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  return (
    <div className={`p-4 rounded-xl border ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <h3 className={`font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
        Data Backup & Restore
      </h3>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        Export your tasks, teams, and activity logs to a file, or restore from a previous backup.
      </p>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download size={18} />
          Export Backup
        </button>
        <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
          <Upload size={18} />
          Import Backup
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
        </label>
      </div>
      <p className={`text-xs mt-3 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
        💡 Tip: Export regularly to prevent data loss. Backups are saved as JSON files.
      </p>
    </div>
  );
}

export default DataBackup;
