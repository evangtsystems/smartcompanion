"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EmailFallbackModal() {
  const [isIOS, setIsIOS] = useState(false);
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isiOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isiOSDevice && isSafari && !localStorage.getItem("fallbackEmail")) {
      setIsIOS(true);
      setVisible(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch("/api/email/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to register email");

      localStorage.setItem("fallbackEmail", email);
      toast.success("Email registered for alerts!");
      setVisible(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save email fallback");
    }
  };

  if (!visible || !isIOS) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#1f3b2e" }}>Stay Connected 🌍</h3>
        <p style={{ fontSize: "14px", color: "#333", marginBottom: "15px" }}>
          Safari on iPhone doesn’t support background notifications.  
          Enter your email to receive alerts instead.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              marginBottom: "10px",
              fontSize: "15px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              background: "#1f3b2e",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Subscribe
          </button>
        </form>

        <button
          onClick={() => setVisible(false)}
          style={{
            marginTop: "12px",
            background: "none",
            border: "none",
            color: "#888",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
