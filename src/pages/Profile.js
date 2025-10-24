// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import isseyTop from "../assets/issey_item.webp"; // <-- put file in /src/assets/

const DEMO_KEY = (uid) => `demoListings:${uid || "guest"}`;

export default function Profile() {
  const { user, profile, loading, logout } = useAuth();
  const nav = useNavigate();

  // ----- items state (hooks at top level) -----
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // seed + load demo listings (per user)
  function ensureDemoSeed(uid) {
    const key = DEMO_KEY(uid);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (existing.length > 0) return existing;

    const seeded = [
      {
        id: "demo-issey-1",
        title: "Issey Miyake Pleats Please Top",
        pricePerDay: 25,
        size: "M",
        category: "Top",
        condition: "Like New",
        photoURLs: [isseyTop], // use imported local asset
        location: "Charleston, SC",
        ownerId: uid || "demo",
        status: "available",
        createdAt: { toMillis: () => Date.now() },
      },
    ];
    localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }

  function loadDemo(uid) {
    const key = DEMO_KEY(uid);
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(arr) ? arr : [];
  }

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setItemsLoading(true);

      // If not signed in, just show seeded demo
      if (!user) {
        const demo = ensureDemoSeed(null);
        if (!cancelled) {
          setItems(demo);
          setItemsLoading(false);
        }
        return;
      }

      try {
        // Try Firestore first (read-only)
        const q = query(collection(db, "clothingItems"), where("ownerId", "==", user.uid));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Client-side sort (handles missing timestamps safely)
        rows.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        // Fallback to demo if Firestore empty
        const finalRows = rows.length > 0 ? rows : ensureDemoSeed(user.uid);

        if (!cancelled) setItems(finalRows);
      } catch {
        // Any Firestore error -> demo
        const demo = ensureDemoSeed(user?.uid);
        if (!cancelled) setItems(demo);
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    }

    loadItems();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ----- auth/profile guards -----
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  // We still want to demo even if not signed in, so no early return here for !user

  if (!profile && user) {
    return (
      <div style={{ padding: 24 }}>
        No profile document found for {user.email}. Create one via Register or add it in
        Firestore at <code>users/{user.uid}</code>.
      </div>
    );
  }

  // ----- computed display fields -----
  const username =
    (profile?.username?.trim() ||
      profile?.name?.toString().toLowerCase().replace(/\s+/g, "")) ??
    "user";
  const locationText = profile?.location || "Charleston, SC";
  const avatarUrl = profile?.avatarUrl || "";
  const activeCount = items.length; // reflect demo/real items

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "18px 16px" }}>
      {/* Header */}
      <div
        style={{
          background: "#c7e0db",
          borderRadius: 18,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: "1px solid #b7cfc8",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "#dde7e4",
            border: "2px solid #fff",
            overflow: "hidden",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div style={{ lineHeight: 1.25, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>
            @{username || "guest"}
          </div>
          <div
            style={{ color: "#1f2937", display: "flex", alignItems: "center", gap: 6 }}
            title={locationText}
          >
            <span>📍</span>
            <span>{locationText}</span>
          </div>
          <div style={{ color: "#6b7280" }}>Active ({activeCount} {activeCount === 1 ? "Listing" : "Listings"})</div>
        </div>

        {user && (
          <button
            onClick={logout}
            style={{
              border: "1px solid #9ca3af",
              background: "#fff",
              padding: "8px 10px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Log out
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div
          style={{
            textAlign: "center",
            padding: "10px 0",
            borderBottom: "2px solid #111827",
            fontWeight: 700,
          }}
        >
          Listed Items
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "10px 0",
            borderBottom: "1px solid #9ca3af",
            color: "#374151",
          }}
        >
          Rented Items
        </div>
      </div>

      {/* Listed Items grid + Add button */}
      <div style={{ padding: "14px 2px" }}>
        <button
          style={{
            border: "1.5px solid #9ca3af",
            background: "#f8fafc",
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
          onClick={() => {
            // demo-friendly: if no auth, just seed again and refresh
            if (!user) {
              ensureDemoSeed(null);
              setItems(loadDemo(null));
            }
            nav("/add-item");
          }}
        >
          + ADD ITEMS
        </button>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {itemsLoading && <div>Loading items…</div>}
          {!itemsLoading && items.length === 0 && <div>No items yet.</div>}
          {items.map((it) => {
            const img =
              it.photoUrl ||
              (Array.isArray(it.photoURLs) ? it.photoURLs[0] : "");

            return (
              <div
                key={it.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {img && (
                  <img
                    src={img}
                    alt={it.title}
                    style={{ width: "100%", height: 140, objectFit: "cover" }}
                  />
                )}
                <div style={{ padding: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{it.title}</div>
                  <div style={{ fontSize: 13, color: "#475569" }}>
                    {it.size ? `Size ${it.size} • ` : ""}
                    {it.location || "—"}
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    ${it.pricePerDay ?? 0}/day
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}