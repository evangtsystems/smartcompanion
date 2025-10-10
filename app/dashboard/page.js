"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchRequests = async () => {
      try {
        const villaId = "68e3ab8d787a06572cab3f9b"; // replace dynamically later
        const res = await fetch(`/api/requests/${villaId}`);
        const data = await res.json();
        if (data.success) setRequests(data.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading requests...</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top controls (inside page, not a second header) */}
      <div
        style={{
          maxWidth: "900px",
          margin: "20px auto 10px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ color: "#1f3b2e", marginBottom: "10px" }}>Owner Dashboard</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/villa/villa-panorea"
            style={{
              background: "#1f3b2e",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: "bold",
              textDecoration: "none",
              transition: "0.2s",
            }}
          >
            ← Back
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: "#c62828",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#b71c1c")}
            onMouseLeave={(e) => (e.target.style.background = "#c62828")}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        {["all", "pending", "in progress", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              margin: "0 5px",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background: filter === status ? "#1f3b2e" : "#ddd",
              color: filter === status ? "white" : "#1f3b2e",
              fontWeight: "bold",
              fontSize: "0.9em",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <main style={{ flex: 1, padding: "10px", maxWidth: "900px", margin: "0 auto" }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No requests found.</p>
        ) : (
          filtered.map((req) => (
            <div
              key={req._id}
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#1f3b2e", marginBottom: "8px" }}>{req.name}</h3>
              <p><strong>Room:</strong> {req.roomNumber}</p>
              <p><strong>Request:</strong> {req.requestType}</p>
              <p><strong>Message:</strong> {req.message}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      req.status === "completed"
                        ? "green"
                        : req.status === "in progress"
                        ? "orange"
                        : "red",
                    fontWeight: "bold",
                  }}
                >
                  {req.status}
                </span>
              </p>
            </div>
          ))
        )}
      </main>

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
