import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/closet_logo.png"; // same logo you added

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      nav("/profile");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#c7dcd6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          background: "#dbe7e4",
          padding: "2.5rem 2rem",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          border: "1px solid #bcd0cb",
        }}
      >
        <img src={logo} alt="Closet Connect Logo" style={{ width: 120, marginBottom: 20 }} />

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            autoComplete="email"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #9ca3af" }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            autoComplete="current-password"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #9ca3af" }}
          />
          <button
            disabled={loading}
            type="submit"
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #000",
              background: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        {err && <p style={{ color: "red", marginTop: 12, fontSize: ".9rem" }}>{err}</p>}

        <p style={{ marginTop: 16 }}>
          New here?{" "}
          <Link to="/register" style={{ color: "#000", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}