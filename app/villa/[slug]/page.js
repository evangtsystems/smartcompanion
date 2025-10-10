"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatbotWidget from "../../../src/components/ChatbotWidget";



export default function VillaPage() {
  const { slug } = useParams();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    roomNumber: "",
    requestType: "cleaning",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchVilla = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/villas/${slug}`);
        const data = await res.json();
        setVilla(data.data);
      } catch (err) {
        console.error("Error fetching villa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVilla();
  }, [slug]);


  const [verified, setVerified] = useState(false);
const [authError, setAuthError] = useState("");

useEffect(() => {
  if (!slug) return;

  // 1) Try token from URL
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlToken = params?.get("token");

  // 2) Or reuse a stored token (same room)
  const key = `room-auth:${slug}`;
  const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const storedToken = stored ? JSON.parse(stored)?.token : null;

  const tokenToCheck = urlToken || storedToken;
  if (!tokenToCheck) {
    setAuthError("Access denied. Please scan the room QR code.");
    return;
  }

  const verify = async () => {
    try {
      const res = await fetch(`/api/rooms/verify?roomId=${slug}&token=${tokenToCheck}`);
      const data = await res.json();
      if (data.valid) {
        setVerified(true);
        // Save for refreshes (only for this slug)
        localStorage.setItem(key, JSON.stringify({ token: tokenToCheck }));
      } else {
        setAuthError("Invalid or expired access link. Please rescan the QR code.");
      }
    } catch (e) {
      setAuthError("Verification failed. Please try again.");
    }
  };
  verify();
}, [slug]);


  // ✅ Scroll immediately once notes are in the DOM
  useEffect(() => {
    if (!loading && villa) {
      const section = document.querySelector(".sticky-section");
      if (section) {
        // Small delay (200ms) so the DOM paints first
        setTimeout(() => {
          section.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 200);
      }
    }
  }, [loading, villa]);

  
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!villa) return;

  // ✅ Always read token safely here
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const token = params?.get("token") || null;

  const payload = {
    ...form,
    villa: villa._id,
    roomSlug: slug,  // 👈 automatically include the villa room
    token,           // 👈 safe: may be null, but never undefined
  };

  try {
    const res = await fetch(`${window.location.origin}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSubmitted(true);
      setForm({
        name: "",
        roomNumber: "",
        requestType: "cleaning",
        message: "",
      });
    } else {
      console.error("Request failed:", await res.text());
    }
  } catch (err) {
    console.error("Error sending request:", err);
  }
};


  if (loading)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>;
  if (!villa)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>Villa not found.</p>
    );

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#fffbee",
        minHeight: "100vh",
      }}
    >
      {/* INTRO SECTION */}
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px 20px",
          background: "linear-gradient(180deg, #fff9e6, #fffbee)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.4rem",
            color: "#1f3b2e",
          }}
        >
          Villa Panorea
        </h1>
        <p style={{ color: "#777", fontStyle: "italic", marginTop: "5px" }}>
          Moraitika, Corfu
        </p>

        <div
          style={{
            maxWidth: "700px",
            margin: "25px auto 0",
            color: "#444",
            lineHeight: "1.6",
          }}
        >
          <h3 style={{ color: "#1f3b2e" }}>Welcome Message</h3>
          <p>
            Welcome to Villa Panorea! We’re delighted to have you with us. Feel
            at home and enjoy your stay in beautiful Moraitika.
          </p>

          <h3 style={{ marginTop: "20px", color: "#1f3b2e" }}>About</h3>
          <p>
            Villa Panorea is a family-run accommodation surrounded by lush
            gardens, located a short walk from the beach in Moraitika, Corfu. It
            offers comfortable apartments, studios, and double rooms with modern
            amenities and authentic hospitality.
          </p>
        </div>
      </div>

      {/* HERO IMAGE */}
      <div style={{ textAlign: "center", margin: "40px auto 10px" }}>
        <img
          src="/panorea-hero1.jpg"
          alt="Villa Panorea"
          style={{
            width: "90%",
            maxWidth: "800px",
            borderRadius: "16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            objectFit: "cover",
          }}
        />
      </div>

      {/* STICKY NOTES SECTION */}
      <section className="sticky-section">
        {[
          { emoji: "🌿", text: "Private Garden Relaxation" },
          { emoji: "🏖️", text: "Just 5 Minutes to the Beach" },
          { emoji: "🍋", text: "Homemade Lemonade Welcome" },
          { emoji: "🛏️", text: "Comfortable Modern Rooms" },
          { emoji: "☀️", text: "Perfect for Family Holidays" },
        ].map((note, i) => {
          const tilts = [-8, -4, 0, 4, 8];
          const tilt = tilts[i % tilts.length];
          return (
            <div
              className="sticky-note"
              key={i}
              style={{ animationDelay: `${i * 1.2}s` }}
            >
              <div
                className="card-inner"
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                <div className="emoji">{note.emoji}</div>
                <p>{note.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* VILLA DETAILS */}
      <div
        style={{
          padding: "20px",
          maxWidth: "900px",
          margin: "0 auto",
          color: "#333",
        }}
      >
        <h3 style={{ color: "#1f3b2e", marginTop: "40px" }}>Accommodation</h3>
        {villa.rooms.map((room, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ marginBottom: "5px", color: "#1f3b2e" }}>
              {room.name}
            </h4>
            <p style={{ marginBottom: "8px" }}>{room.description}</p>
            <p>
              <strong>Capacity:</strong> {room.capacity} guest
              {room.capacity > 1 ? "s" : ""}
            </p>
            <p>
              <strong>Amenities:</strong> {room.amenities.join(", ")}
            </p>
          </div>
        ))}

        {/* GUEST REQUEST FORM */}
        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "12px",
            marginTop: "40px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#1f3b2e" }}>Guest Request Form</h3>

          {submitted ? (
            <p style={{ color: "green", marginTop: "10px" }}>
              ✅ Request submitted successfully! We’ll handle it soon.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                placeholder="Room Number"
                value={form.roomNumber}
                onChange={(e) =>
                  setForm({ ...form, roomNumber: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <select
                value={form.requestType}
                onChange={(e) =>
                  setForm({ ...form, requestType: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="cleaning">Cleaning</option>
                <option value="dinner">Dinner</option>
                <option value="groceries">Groceries</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Describe your request..."
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minHeight: "80px",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#1f3b2e",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.target.style.background = "#2a5a43")}
                onMouseOut={(e) => (e.target.style.background = "#1f3b2e")}
              >
                Send Request
              </button>
            </form>
          )}
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .sticky-section {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 25px;
          margin: 60px auto 80px;
          max-width: 1000px;
          padding: 0 15px;
        }

        .sticky-note {
          background: #fff7b3;
          width: 160px;
          height: 160px;
          border-radius: 12px;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-60px) scale(0.9);
          opacity: 0;
          animation: dropIn 0.9s ease forwards,
            floaty 5s ease-in-out infinite;
        }

        .card-inner {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform-origin: 50% 20%;
        }

        .sticky-note .emoji {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .sticky-note p {
          font-size: 0.95rem;
          text-align: center;
          color: #333;
          padding: 0 8px;
        }

        @keyframes dropIn {
          0% {
            transform: translateY(-80px) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @media (max-width: 768px) {
          .sticky-note {
            width: 140px;
            height: 140px;
          }
          .sticky-section {
            gap: 18px;
          }
        }
      `}</style>
      {/* Chatbot Widget with token protection */}
{verified ? (
  <ChatbotWidget roomId={`${slug}`} />
) : (
  <p
    style={{
      textAlign: "center",
      color: "red",
      fontWeight: "500",
      margin: "30px 0",
      fontSize: "1.1rem",
    }}
  >
    {authError || "Verifying access... Please wait."}
  </p>
)}


    </div>
  );
}
