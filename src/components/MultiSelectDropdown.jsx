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
        className={`w-full text-left border p-2 rounded-lg transition-all ${
          darkMode ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-650" : "bg-white border-gray-300 hover:border-gray-400"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1 min-h-[24px] items-center">
            {selected.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              selected.map((item, idx) => (
                <span 
                  key={idx}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {item}
                </span>
              ))
            )}
          </div>
          <div className={`flex items-center gap-2 ml-2 flex-shrink-0 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            <span className="text-xs font-semibold">{selected.length}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
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
            {filtered.map((o) => {
              const isSelected = selected.includes(o.value);
              return (
                <div
                  key={o.id || o.value} 
                  onClick={() => toggleValue(o.value)}
                  className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? darkMode 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-blue-500 text-white shadow-md"
                      : darkMode 
                        ? "hover:bg-gray-700 text-gray-100" 
                        : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <span className="text-sm font-medium">{o.label || o.value}</span>
                  {isSelected && (
                    <svg 
                      className="w-5 h-5 ml-2 flex-shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
              );
            })}
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
