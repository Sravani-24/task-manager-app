import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Added for dark mode

const Register = () => {
  const { register } = useAuth();
  const { darkMode } = useTheme(); // Access dark mode
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    const success = register(form.username, form.password, form.email, form.role);
    if (success) {
      alert("Registration successful!");
      navigate("/login");
    } else {
      alert("Username already exists or invalid data");
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <form
        onSubmit={handleSubmit}
        className={`p-8 rounded-lg shadow-md w-96 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className={`mb-4 w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`mb-4 w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`mb-4 w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className={`mb-6 w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 w-full rounded hover:bg-green-600 transition"
        >
          Register
        </button>

        <p className={`mt-4 text-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
