import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Load users from storage or seed defaults once
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("users");
      if (saved) return JSON.parse(saved);
    } catch {}
    const seeded = [
      { id: Date.now() + 1, name: "Alice", username: "alice", email: "alice@example.com", password: "1234", role: "user" },
      { id: Date.now() + 2, name: "Charlie", username: "charlie", email: "charlie@example.com", password: "1234", role: "user" },
      { id: Date.now() + 3, name: "Bob", username: "bob", email: "bob@example.com", password: "1234", role: "admin" },
      { id: Date.now() + 4, name: "David", username: "david", email: "david@example.com", password: "1234", role: "admin" },
    ];
    localStorage.setItem("users", JSON.stringify(seeded));
    return seeded;
  });

  const [user, setUser] = useState(null);

  // ✅ Restore logged-in user on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // ✅ Login function
  const login = (usernameOrEmail, password) => {
    const existingUser = users.find(
      (u) =>
        (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
        u.password === password
    );

    if (existingUser) {
      const loggedInUser = {
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role.toLowerCase(), // lowercase role
      };
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser)); // store user
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // ✅ Clear from storage on logout
  };

  // Register function
  const register = (username, password, email, role) => {
    if (!username || !password || !email || !role) return false;
    const exists = users.find((u) => u.username === username || u.email === email);
    if (exists) return false;

    const newUser = { id: Date.now(), name: username, username, password, email, role: role.toLowerCase() };
    setUsers([...users, newUser]);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, users, setUsers, login, logout, register }}>

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
