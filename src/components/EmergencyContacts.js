"use client";
import { useState, useEffect } from "react";

export default function EmergencyContacts() {
  const [expanded, setExpanded] = useState(true);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setExpanded(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const contacts = [
    { label: "European Emergency Number", number: "112", emoji: "🚨" },
    { label: "Police", number: "100", emoji: "👮‍♂️" },
    { label: "Fire Brigade", number: "199", emoji: "🔥" },
    { label: "Ambulance (EKAB)", number: "166", emoji: "🚑" },
    { label: "Coast Guard", number: "108", emoji: "⚓" },
    { label: "Corfu General Hospital", number: "2661360400", emoji: "🏥" },
  ];

  return (
    <section
      style={{
        background: "#fff5f0",
        color: "#1f3b2e",
        textAlign: "center",
        padding: "60px 20px",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        <h2
          onClick={() => setExpanded(!expanded)}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.9rem",
            marginBottom: expanded ? "30px" : "0",
            cursor: "pointer",
            userSelect: "none",
            background: "#1f3b2e",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            transition: "background 0.3s ease",
          }}
        >
          {expanded ? "Emergency Contacts in Greece" : "📞 Emergency Contacts in Greece"}
        </h2>

        {expanded && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "25px",
              marginTop: "30px",
              transition: "max-height 0.5s ease, opacity 0.5s ease",
            }}
          >
            {contacts.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                style={{
                  flex: "1 1 240px",
                  background: "white",
                  padding: "20px",
                  borderRadius: "14px",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                  textDecoration: "none",
                  color: "#1f3b2e",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 15px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 10px rgba(0,0,0,0.08)";
                }}
              >
                <div style={{ fontSize: "2rem" }}>{item.emoji}</div>
                <h3 style={{ margin: "10px 0 5px", fontSize: "1.2rem" }}>{item.label}</h3>
                <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{item.number}</p>
              </a>
            ))}
          </div>
        )}

        {!expanded && (
          <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#555" }}>
            Tap to view emergency numbers
          </p>
        )}
      </div>
    </section>
  );
}
