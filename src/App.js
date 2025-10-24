import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { useAuth } from "./auth";
import AddItem from "./pages/AddItem";


function TabBar() {
  const loc = useLocation();
  const is = (p) => loc.pathname === p;
  const tab = (to, label) => (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: is(to) ? "#000" : "#334155",
        background: is(to) ? "#c7e0db" : "#d6e6e2",
        padding: "10px 18px",
        borderRadius: 14,
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "14px 20px",
        background: "#c7e0db",
        display: "flex",
        gap: 16,
        justifyContent: "space-around",
        borderTop: "1px solid #b7cfc8",
      }}
    >
      {tab("/browse", "Browse")}
      {tab("/wishlist", "Wishlist")}
      {tab("/profile", "Profile")}
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80, background: "#e7f1ee" }}>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/add-item"
            element={
              <RequireAuth>
                <AddItem />
              </RequireAuth>
            }
        />
        <Route path="/browse" element={<div style={{ padding: 24 }}><h2>Browse</h2></div>} />
        <Route path="/wishlist" element={<div style={{ padding: 24 }}><h2>Wishlist</h2></div>} />
      </Routes>
      <TabBar />
    </div>
  );
}
