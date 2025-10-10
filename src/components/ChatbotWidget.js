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
  const [resolvedRoomId, setResolvedRoomId] = useState("villa-panorea");
  const chatEndRef = useRef(null);

  // 🏠 Resolve the room ID (supports ?room=101 etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setResolvedRoomId(`villa-panorea-${room}`);
    } else {
      setResolvedRoomId(roomId || "villa-panorea");
    }
  }, [roomId]);

  // 🟢 Connect to Socket.IO server
  useEffect(() => {
    if (!resolvedRoomId) return;

    const newSocket = io(apiBaseUrl);
setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to chat server");
      newSocket.emit("joinRoom", resolvedRoomId);
    });

    newSocket.on("chatHistory", (history) => {
      setMessages(history);
    });

    newSocket.on("newMessage", (msg) => {
  setMessages((prev) => [...prev, msg]);

  // 🔔 Notify guest only if the chat is currently closed
  if (msg.sender !== "guest" && !showChat) {
    // 📳 Vibrate on mobile
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

    // 🔊 Optional short notification sound
    const audio = new Audio("/notify.mp3");
    audio.play().catch(() => {});
  }
});


    return () => newSocket.close();
  }, [resolvedRoomId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-hide hint after 5s
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 📨 Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const messageData = {
      roomId: resolvedRoomId,
      sender: "guest",
      text: input.trim(),
    };

    socket.emit("sendMessage", messageData);
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
            animation: "fadeOut 3s forwards",
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
            animation: "pulseGlow 1.5s ease-in-out 3, bounceIn 0.6s ease-out",
            border: "2px solid #fff3b0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(255, 222, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.1)";
          }}
        >
          {/* Two Chat Clouds Icon (white) */}
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

      {/* 🪟 Chat Window */}
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
            position: "relative",
            animation: "popUp 0.3s ease forwards",
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
              letterSpacing: "0.5px",
              fontSize: "1rem",
              position: "relative",
            }}
          >
            💬 Chat with Host
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "8px",
                fontSize: "1.3rem",
                cursor: "pointer",
                color: "#1f3b2e",
              }}
              onClick={() => setShowChat(false)}
            >
              ×
            </span>
          </div>

          {/* Chat Messages */}
          <div
            id="chat-content"
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              background: "#fffdf2",
            }}
          >
            {messages.map((msg, idx) => {
  const isGuest = msg.sender === "guest";
  return (
    <div
      key={idx}
      style={{
        display: "flex",
        justifyContent: isGuest ? "flex-end" : "flex-start",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isGuest ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            background: isGuest ? "#4caf50" : "#c9be60ff",
            color: isGuest ? "#fff" : "#222",
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
        <small
          style={{
            color: "#535353ff",
            fontSize: "0.7rem",
            marginTop: "3px",
            paddingRight: isGuest ? "4px" : "0",
          }}
        >
          {isGuest ? "You" : "Host"}
        </small>
      </div>
    </div>
  );
})}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
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
              name="message"
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

      {/* Animations */}
      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 223, 64, 0); }
          50% { transform: scale(1.1); box-shadow: 0 0 25px rgba(255, 223, 64, 0.8); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        @keyframes popUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
