import React, { useState, useRef, useEffect } from "react";

const MultiSelectDropdown = ({ 
  options = [], 
  selected = [], 
  onChange, 
  placeholder = "Select...", 
  darkMode = false 
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef();

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleValue = (val) => {
    const exists = selected.includes(val);
    const next = exists ? selected.filter((s) => s !== val) : [...selected, val];
    onChange(next);
  };

  const filtered = options.filter((o) =>
    `${o.label || o.value}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`w-full text-left border p-2 rounded ${
          darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="truncate">
            {selected.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              <span className="text-sm">{selected.join(", ")}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 ml-2">{selected.length}</div>
        </div>
      </button>

      {open && (
        <div 
          className={`absolute z-40 mt-1 w-full rounded shadow-lg border ${
            darkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white border-gray-300"
          }`}
        >
          <div className="p-2">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search..."
              className={`w-full p-2 border rounded ${
                darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white border-gray-300"
              }`}
            />
          </div>

          <div className="max-h-48 overflow-auto p-2 space-y-1">
            {filtered.length === 0 && (
              <div className="text-sm text-gray-500 p-2">No users found</div>
            )}
            {filtered.map((o) => (
              <label 
                key={o.id || o.value} 
                className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } w-full`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(o.value)}
                  onChange={() => toggleValue(o.value)}
                  className="flex-shrink-0"
                />
                <span className="text-sm break-words flex-1">{o.label || o.value}</span>
              </label>
            ))}
          </div>
          
          <div className={`flex items-center justify-between p-2 border-t ${
            darkMode ? "border-gray-600" : "border-gray-300"
          }`}>
            <button 
              type="button" 
              onClick={() => onChange([])} 
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
            <button 
              type="button" 
              onClick={() => setOpen(false)} 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
