// src/AuthProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      signOut: () => fbSignOut(auth),
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}