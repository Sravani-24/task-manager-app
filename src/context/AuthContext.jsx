import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setUser({ uid: firebaseUser.uid, ...snap.data() });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "user", 
            });
          }
        } catch (err) {
          console.error("Auth Fetch Error:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, username, role = "user") => {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      username,
      email,
      role: role.toLowerCase(),
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", res.user.uid), userData);

    setUser({ uid: res.user.uid, ...userData });
    return { uid: res.user.uid, ...userData };
  };

  // Create user by admin (does NOT auto-login)
  const createUser = async (email, password, username, role = "user") => {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      username,
      email,
      role: role.toLowerCase(),
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", res.user.uid), userData);

    await signOut(auth);
    
    return { uid: res.user.uid, ...userData };
  };

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", res.user.uid));

    if (!snap.exists()) throw new Error("User record missing in Firestore");

    const loggedUser = { uid: res.user.uid, ...snap.data() };
    setUser(loggedUser);
    return loggedUser;
  };
const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const usersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return usersList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
<AuthContext.Provider value={{ user, register, createUser, login, logout, getAllUsers }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
