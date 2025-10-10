"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/owner/login", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#1f3b2e",
          color: "white",
          padding: "14px 20px",
          fontSize: "1.2em",
          fontWeight: "bold",
          textAlign: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        Smart Companion — Owner Access
      </header>

      {/* Centered form container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "white",
            borderRadius: "12px",
            padding: "30px 25px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              color: "#1f3b2e",
              textAlign: "center",
              marginBottom: "25px",
              fontSize: "1.4em",
            }}
          >
            Welcome Back
          </h2>

          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#333",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "16px",
            }}
          />

          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#333",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "16px",
            }}
          />

          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                fontSize: "0.9em",
                marginBottom: "10px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#1f3b2e",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              fontSize: "1em",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#264a38")}
            onMouseLeave={(e) => (e.target.style.background = "#1f3b2e")}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "10px",
          fontSize: "0.85em",
          color: "#777",
        }}
      >
        © {new Date().getFullYear()} Smart Companion
      </footer>
    </div>
  );
}
