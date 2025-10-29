"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function GuestEmailManager() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch("/api/admin/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRooms(data.rooms);
      })
      .catch((err) => console.error("Error fetching rooms:", err))
      .finally(() => setLoading(false));
  }, []);

  const updateEmail = async (roomId, email) => {
    setUpdating(roomId);
    try {
      const res = await fetch("/api/admin/update-room-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, guestEmail: email }),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => (r.roomId === roomId ? { ...r, guestEmail: email } : r))
        );
        alert("✅ Email updated!");
      } else {
        alert("❌ Failed to update email");
      }
    } catch (err) {
      console.error("Error updating email:", err);
      alert("❌ Error updating email");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <p>Loading rooms...</p>;

  return (
    <div style={{ width: "100%" }}>
      {rooms.map((r) => (
        <div
          key={r.roomId}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "12px",
            gap: "10px",
            background: "#fafafa",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Room ID */}
          <strong
            style={{
              flex: "1 1 100px",
              fontSize: "0.95rem",
              color: "#1f3b2e",
              minWidth: "120px",
              wordBreak: "break-word",
            }}
          >
            {r.roomId}
          </strong>

          {/* Email Input */}
          <input
            type="email"
            defaultValue={r.guestEmail || ""}
            placeholder="guest@example.com"
            onChange={(e) => (r.newEmail = e.target.value)}
            style={{
              flex: "1 1 180px",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.9rem",
              minWidth: "160px",
            }}
          />

          {/* Save Button */}
          <button
            onClick={() => updateEmail(r.roomId, r.newEmail || r.guestEmail || "")}
            disabled={updating === r.roomId}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              background: "#1f3b2e",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.9rem",
              flexShrink: 0,
              width: "100%",
              maxWidth: "120px",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2a5b42")}
            onMouseLeave={(e) => (e.target.style.background = "#1f3b2e")}
          >
            {updating === r.roomId ? "Saving..." : "Save"}
          </button>
        </div>
      ))}

      {/* ✅ Responsive tweak for very small screens */}
      <style jsx>{`
        @media (max-width: 600px) {
          div[style] > strong {
            width: 100%;
            margin-bottom: 4px;
          }
          div[style] > input {
            width: 100%;
          }
          div[style] > button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}



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

  const villaId = "68e3ab8d787a06572cab3f9b"; // replace dynamically later

  const fetchRequests = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requests/${villaId}`,
      {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      }
    );
    const data = await res.json();
    if (data.success) setRequests(data.data);
  } catch (err) {
    console.error("Error fetching requests:", err);
  } finally {
    setLoading(false);
  }
};


  fetchRequests();
  const interval = setInterval(fetchRequests, 5000); // 🔁 refresh every 5s
  return () => clearInterval(interval);
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
      <div
  style={{
    maxWidth: "900px",
    margin: "25px auto 15px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px", // ✅ adds space between title & buttons on wrap
  }}
>
  <h1
    style={{
      color: "#1f3b2e",
      margin: 0,
      fontSize: "1.8rem",
      letterSpacing: "0.5px",
    }}
  >
    Owner Dashboard
  </h1>

  <div
    style={{
      display: "flex",
      gap: "12px", // ✅ horizontal gap between Back and Logout buttons
      flexWrap: "wrap",
    }}
  >
    <Link
      href="/villa/villa-panorea"
      style={{
        background: "#1f3b2e",
        color: "white",
        padding: "7px 14px",
        borderRadius: "6px",
        fontWeight: "bold",
        textDecoration: "none",
        fontSize: "0.95rem",
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
        padding: "7px 14px",
        border: "none",
        borderRadius: "6px",
        fontWeight: "bold",
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => (e.target.style.background = "#b71c1c")}
      onMouseLeave={(e) => (e.target.style.background = "#c62828")}
    >
      Logout
    </button>
  </div>

  {/* ✅ Responsive adjustments */}
  <style jsx>{`
    @media (max-width: 600px) {
      h1 {
        font-size: 1.5rem !important;
      }
      div[style*="display: flex"] {
        flex-direction: column !important;
        align-items: center !important;
      }
    }
  `}</style>
</div>



      {/* Filter Buttons */}
<div
  style={{
    marginBottom: "20px",
    textAlign: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    padding: "0 10px",
  }}
>
  {["all", "pending", "in progress", "completed"].map((status) => (
    <button
      key={status}
      onClick={() => setFilter(status)}
      style={{
        padding: "10px 20px",
        borderRadius: "25px",
        border: "none",
        cursor: "pointer",
        background: filter === status ? "#1f3b2e" : "#e0e0e0",
        color: filter === status ? "white" : "#1f3b2e",
        fontWeight: "bold",
        fontSize: "0.95rem",
        minWidth: "120px",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  ))}

  {/* ✅ Responsive tweaks */}
  <style jsx>{`
    @media (max-width: 600px) {
      button {
        font-size: 0.9rem !important;
        padding: 8px 16px !important;
        min-width: 100px !important;
      }
    }
  `}</style>
</div>


      {/* 📨 Guest Email Management */}
<div
  style={{
    maxWidth: "900px",
    margin: "20px auto",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  }}
>
  <h2 style={{ color: "#1f3b2e", marginBottom: "10px" }}>Guest Email Management</h2>
  <GuestEmailManager />
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
