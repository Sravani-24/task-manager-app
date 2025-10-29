import React, { useState } from "react";

const TaskForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, id: Date.now(), status: "To Do" });
    setForm({ title: "", description: "", priority: "Medium" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg mb-4">
      <input
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
      />
      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-2"
      >
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <button className="bg-blue-500 text-white px-4 py-3 md:py-2 rounded w-full md:w-auto">Add Task</button>
    </form>
  );
};

export default TaskForm;
