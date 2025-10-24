// src/auth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthCtx = createContext({ user: null, profile: null, loading: true, logout: async () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [profile, setProfile] = useState(null); // Firestore /users/{uid}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // load Firestore user doc with the same uid
      const snap = await getDoc(doc(db, "users", u.uid));
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}