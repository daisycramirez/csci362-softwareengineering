// src/pages/AddItem.js
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { useAuth } from "../auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [exchangeMethod, setExchangeMethod] = useState("");
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in first.");

    try {
      setSaving(true);
      const urls = [];
      for (const file of photos) {
        const path = `items/${user.uid}/${Date.now()}-${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      await addDoc(collection(db, "clothingItems"), {
        title,
        description,
        category,
        condition,
        size,
        brand,
        pricePerDay: parseFloat(price),
        exchangeMethod,
        photoURLs: urls,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert("Item saved!");
      nav("/profile");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: "24px 18px",
        background: "#eaf0ee",
        borderRadius: 16,
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 14 }}>
        List Item
      </h2>

      {/* Photo Uploads */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 70,
              height: 70,
              background: "#dce6e2",
              borderRadius: 10,
              overflow: "hidden",
              border: "1.5px dashed #93a3a0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photos[i] ? (
              <img
                src={URL.createObjectURL(photos[i])}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 22, color: "#556763" }}>📷</span>
            )}
          </div>
        ))}
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotos}
        style={{ marginBottom: 16 }}
      />

      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Name Item"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={inputStyle}
        />

        <textarea
          placeholder="Add Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, height: 80 }}
        />

        <label style={labelStyle}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select category</option>
          <option value="Tops">Tops</option>
          <option value="Bottoms">Bottoms</option>
          <option value="Dresses">Dresses</option>
          <option value="Shoes">Shoes</option>
          <option value="Accessories">Accessories</option>
        </select>

        <label style={labelStyle}>Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select condition</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Used">Used</option>
        </select>

        <label style={labelStyle}>Size</label>
        <input
          type="text"
          placeholder="e.g., 27 / M"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Brand Name</label>
        <input
          type="text"
          placeholder="Brand Name"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Price per Day ($)</label>
        <input
          type="number"
          placeholder="Price (per day)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
          min="0"
          step="0.01"
        />

        <label style={labelStyle}>Exchange Method</label>
        <select
          value={exchangeMethod}
          onChange={(e) => setExchangeMethod(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select method</option>
          <option value="Meet in person">Meet in person</option>
          <option value="Drop-off / Pickup">Drop-off / Pickup</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            background: "#35685d",
            color: "#fff",
            border: "none",
            padding: "12px 0",
            fontWeight: 700,
            borderRadius: 12,
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          {saving ? "Saving..." : "Save Item"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5d1",
  marginBottom: 14,
  fontSize: 15,
};

const labelStyle = {
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
  color: "#374151",
};

const selectStyle = {
  ...inputStyle,
  background: "#fff",
};