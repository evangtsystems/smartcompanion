"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import apiBaseUrl from '../../../src/config/api';


export default function AdminChatDashboard() {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
useEffect(() => {
  if (socket) return; // prevent duplicate connections

  const s = io(apiBaseUrl, { transports: ["websocket"] });
setSocket(s);

  s.on("connect", () => {
    console.log("👑 Connected as Admin");
    s.emit("adminJoin");
  });

  s.on("roomsList", (list) => setRooms(list));
  s.on("updateRooms", (list) => setRooms(list));

  s.on("chatHistory", (history) => setMessages(history));

s.on("newMessage", (msg) => {
  setMessages((prev) => {
    // Avoid duplicates in chat list
    const alreadyExists = prev.some(
      (m) =>
        m.text === msg.text &&
        m.sender === msg.sender &&
        m.roomId === msg.roomId
    );
    if (alreadyExists) return prev;

    // Only add to visible chat if it's the active room
    if (msg.roomId === selectedRoom) {
      return [...prev, msg];
    } else {
      // Increment notifications only for guest messages
      if (msg.sender === "guest") {
        setNotifications((n) => ({
          ...n,
          [msg.roomId]: (n[msg.roomId] || 0) + 1,
        }));
      }
      return prev;
    }
  });
});

s.on("guestMessageNotification", ({ roomId }) => {
  if (roomId !== selectedRoom) {
    setNotifications((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  }
});





  

  return () => {
    s.disconnect();
  };
  // 👇 Notice — only run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const joinRoom = (roomId) => {
    if (!socket) return;
    setSelectedRoom(roomId);
    setNotifications((prev) => ({ ...prev, [roomId]: 0 }));
    socket.emit("joinRoom", roomId);
  };

  const sendMessage = (e) => {
  e.preventDefault();
  if (!message.trim() || !socket || !selectedRoom) return;

  // Create local preview immediately
  const localMsg = {
    roomId: selectedRoom,
    sender: "host",
    text: message,
    timestamp: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, localMsg]);

  // Send to backend
  socket.emit("sendMessage", {
    roomId: selectedRoom,
    sender: "host",
    text: message,
  });

  setMessage("");
};


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Poppins', sans-serif",
        background: "#f7f7e6",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          background: "#fff9b0",
          padding: "20px",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          overflowY: "auto",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#1f3b2e" }}>💬 Active Rooms</h2>
        {rooms.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>No rooms yet</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room}
              onClick={() => joinRoom(room)}
              style={{
                padding: "10px",
                marginTop: "10px",
                background:
                  selectedRoom === room ? "#1f3b2e" : "rgba(255,255,255,0.8)",
                color: selectedRoom === room ? "#fff" : "#1f3b2e",
                borderRadius: "8px",
                cursor: "pointer",
                position: "relative",
                fontWeight: "bold",
              }}
            >
              {room}
              {notifications[room] > 0 && (
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8em",
                  }}
                >
                  {notifications[room]}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            background: "#1f3b2e",
            color: "#fff9b0",
            padding: "12px",
            textAlign: "center",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          {selectedRoom ? `Chat with ${selectedRoom}` : "Select a room to chat"}
        </div>

        <div
          style={{
            flex: 1,
            padding: "15px",
            overflowY: "auto",
            background: "#fffdf2",
          }}
        >
          {messages.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              {selectedRoom
                ? "No messages yet in this room."
                : "Select a room to start chatting."}
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "host" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    background:
                      msg.sender === "host" ? "#1f3b2e" : "#fff7b3",
                    color: msg.sender === "host" ? "#fff9b0" : "#1f3b2e",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    maxWidth: "70%",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {selectedRoom && (
          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              padding: "10px",
              background: "#fff9b0",
              borderTop: "1px solid #ddd",
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
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
        )}
      </div>
    </div>
  );
}
