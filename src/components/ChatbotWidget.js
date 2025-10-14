"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import apiBaseUrl from "../config/api";

export default function ChatbotWidget({ roomId }) {
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [resolvedRoomId, setResolvedRoomId] = useState(null);
  const chatEndRef = useRef(null);

  // 🏠 Resolve the room ID from URL (?room=101 etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setResolvedRoomId(`villa-panorea-${room}`);
    } else {
      setResolvedRoomId(roomId || "villa-panorea");
    }
  }, [roomId]);

  // 🟢 Connect to Socket.IO server once per room
  useEffect(() => {
    if (!resolvedRoomId) return;

    const s = io(apiBaseUrl, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Guest connected to chat");
      s.emit("joinRoom", resolvedRoomId);
    });

    s.on("chatHistory", (history) => {
      setMessages(history);
    });

    s.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // 🔔 Notify guest if chat closed
      if (msg.sender !== "guest" && !showChat) {
        if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        const audio = new Audio("/notify.mp3");
        audio.play().catch(() => {});
      }
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, [resolvedRoomId]);

  // 🔽 Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⏳ Hide tooltip after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // ✉️ Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const msg = {
      roomId: resolvedRoomId,
      sender: "guest",
      text: input.trim(),
    };

    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        right: "25px",
        zIndex: 9999,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* 💬 Tooltip */}
      {!showChat && showHint && (
        <div
          style={{
            position: "absolute",
            bottom: "90px",
            right: "10px",
            background: "#fff9c4",
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "0.9rem",
            color: "#1f3b2e",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          ☁️ Need help? Tap me!
        </div>
      )}

      {/* Floating Button */}
      {!showChat && (
        <div
          onClick={() => setShowChat(true)}
          style={{
            background: "linear-gradient(145deg, #418f22ff, #ffe76b)",
            borderRadius: "50%",
            width: "70px",
            height: "70px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: "transform 0.25s ease, box-shadow 0.3s ease",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M4 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2zm12 3h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3l-3 2v-2h-2a2 2 0 0 1-2-2v-1h4a2 2 0 0 0 2-2V7z" />
          </svg>
        </div>
      )}

      {/* Chat Window */}
      {showChat && (
        <div
          style={{
            width: "320px",
            height: "420px",
            background: "#fffef7",
            borderRadius: "20px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(90deg, #fff86b, #ffd94f)",
              padding: "12px",
              textAlign: "center",
              fontWeight: "700",
              color: "#1f3b2e",
              fontSize: "1rem",
              position: "relative",
            }}
          >
            💬 Chat with Host
            <span
              onClick={() => setShowChat(false)}
              style={{
                position: "absolute",
                right: "12px",
                top: "8px",
                fontSize: "1.3rem",
                cursor: "pointer",
                color: "#1f3b2e",
              }}
            >
              ×
            </span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              background: "#fffdf2",
            }}
          >
            {messages.map((msg, i) => {
              const isGuest = msg.sender === "guest";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isGuest ? "flex-end" : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      background: isGuest ? "#4caf50" : "#fff7b3",
                      color: isGuest ? "#fff" : "#333",
                      borderRadius: isGuest
                        ? "15px 15px 0 15px"
                        : "15px 15px 15px 0",
                      padding: "8px 12px",
                      maxWidth: "75%",
                      wordWrap: "break-word",
                      fontSize: "0.9rem",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              padding: "8px",
              background: "#fff9c4",
              borderTop: "1px solid #eee",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                border: "none",
                borderRadius: "10px",
                padding: "8px 10px",
                outline: "none",
                background: "#fff",
                fontSize: "0.95rem",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#1f3b2e",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "8px 12px",
                marginLeft: "6px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
