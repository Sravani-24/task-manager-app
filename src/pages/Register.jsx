import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Users, Zap } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      //Force role to "user"
      await register(form.email, form.password, form.username, "user");

      alert("✅ Registration successful!");
      navigate("/login");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Left Side - Brand Section */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
        darkMode 
          ? "bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900" 
          : "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600"
      }`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 animate-slideUp">
              Join TeamTrack
            </h1>
            <p className="text-xl text-green-100 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Start managing your team's tasks efficiently today
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Collaboration</h3>
                <p className="text-green-100 text-sm">Work together seamlessly with your team members</p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Team Management</h3>
                <p className="text-green-100 text-sm">Organize teams and assign tasks efficiently</p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Track Progress</h3>
                <p className="text-green-100 text-sm">Monitor task completion and team performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className={`flex-1 flex items-center justify-center p-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="w-full max-w-md animate-scaleIn">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              TeamTrack
            </h1>
            <p className={`text-sm mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Create your account to get started
            </p>
          </div>

          <div className={`p-8 rounded-2xl shadow-2xl ${
            darkMode 
              ? "bg-gray-800 border border-gray-700" 
              : "bg-white border border-gray-100"
          }`}>
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}>
                Create Account
              </h2>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Fill in the details below to create your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Username
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`} size={18} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`} size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`} size={18} />
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                {loading ? "Creating Account..." : (
                  <>
                    Create Account
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className={`absolute inset-0 flex items-center ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}>
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-4 ${
                    darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-600"
                  }`}>
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link 
                  to="/login" 
                  className={`text-green-600 hover:text-green-700 font-semibold text-sm hover:underline transition-colors`}
                >
                  Sign in to your account →
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className={`text-center text-xs mt-6 ${
            darkMode ? "text-gray-500" : "text-gray-500"
          }`}>
            © 2025 TeamTrack. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
