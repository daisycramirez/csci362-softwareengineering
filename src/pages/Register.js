import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/closet_logo.png"; // 👈 import your logo image

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ phone: "", email: "", username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );
      const uid = cred.user.uid;

      await setDoc(doc(db, "users", uid), {
        userId: uid,
        name: form.username,
        email: form.email.trim(),
        phone: form.phone,
        location: "",
        roles: { lender: true, renter: true },
        activeCount: 0,
        createdAt: serverTimestamp(),
        avatarUrl: "",
      });

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
        background: "#c7dcd6", // mint green like your Figma
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
        {/* logo */}
        <img
          src={logo}
          alt="Closet Connect Logo"
          style={{ width: "120px", marginBottom: "20px" }}
        />

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={onChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
            }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
            }}
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={onChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #9ca3af",
            }}
          />

          <button
            disabled={loading}
            type="submit"
            style={{
              marginTop: "12px",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #000",
              background: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "SIGN UP"}
          </button>
        </form>

        {err && (
          <p style={{ color: "red", marginTop: "12px", fontSize: "0.9rem" }}>{err}</p>
        )}

        <p style={{ marginTop: "16px", fontSize: "0.95rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#000", fontWeight: "600" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}