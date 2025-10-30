import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; 

const Login = () => {
  const { login } = useAuth();
  const { darkMode } = useTheme(); 
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const loggedInUser = await login(form.usernameOrEmail, form.password);

    if (!loggedInUser) {
      alert("Login failed");
      return;
    }

    if (loggedInUser.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/user");
    }
  } catch (err) {
    alert(err.message);
  }
};




  return (
    <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <form
        onSubmit={handleSubmit}
        className={`p-8 rounded-lg shadow-md w-96 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="text"
          name="usernameOrEmail"
          placeholder="Email"

          value={form.usernameOrEmail}
          onChange={handleChange}
          className={`mb-4 w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`mb-6 w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-600 transition"
        >
          Login
        </button>

        <p className={`mt-4 text-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
