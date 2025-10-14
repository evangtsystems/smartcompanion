"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import apiBaseUrl from "../../../src/config/api";
import toast from "react-hot-toast";

export default function AdminChatDashboard() {
  const socketRef = useRef(null); // ✅ persistent socket
  const [rooms, setRooms] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ Stable socket connection
  useEffect(() => {
    if (socketRef.current) return;

    const s = io(apiBaseUrl, { transports: ["websocket"] });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("👑 Connected as Admin");
      s.emit("adminJoin");
    });

    s.on("roomsList", (list) => setRooms(list));
    s.on("updateRooms", (list) => setRooms(list));
    s.on("chatHistory", (history) => setMessages(history));

    s.on("newMessage", (msg) => {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) =>
            m.text === msg.text &&
            m.sender === msg.sender &&
            m.roomId === msg.roomId
        );
        if (alreadyExists) return prev;

        if (msg.roomId === selectedRoom) {
          return [...prev, msg];
        } else if (msg.sender === "guest") {
          setNotifications((n) => ({
            ...n,
            [msg.roomId]: (n[msg.roomId] || 0) + 1,
          }));
        }
        return prev;
      });

      // ✅ Service Worker notification hook
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "chatMessage",
          text: msg.text,
        });
      }
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
      socketRef.current = null;
    };
  }, []); // ✅ run once only

  // 🏠 Join room
  const joinRoom = (roomId) => {
    const socket = socketRef.current;
    if (!socket) return;
    setSelectedRoom(roomId);
    setNotifications((prev) => ({ ...prev, [roomId]: 0 }));
    socket.emit("joinRoom", roomId);
  };

  // 💬 Send message
  const sendMessage = (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!message.trim() || !socket || !selectedRoom) return;

    const localMsg = {
      roomId: selectedRoom,
      sender: "host",
      text: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    socket.emit("sendMessage", {
      roomId: selectedRoom,
      sender: "host",
      text: message,
    });

    setMessage("");
  };

  // 🧹 Delete all chats
  const clearAllChats = async () => {
    if (!window.confirm("⚠️ Delete ALL chat history?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/chat/delete-all`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted ${data.deletedCount} messages`);
        setMessages([]);
        setRooms([]);
        setSelectedRoom(null);
      } else {
        toast.error("Failed to delete chats");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // 🧽 Delete selected room
  const clearSelectedRoom = async () => {
    if (!selectedRoom) return toast.error("No room selected");
    if (!window.confirm(`Delete all messages in ${selectedRoom}?`)) return;
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/chat/delete-room/${selectedRoom}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Cleared ${data.deletedCount} messages`);
        setMessages([]);
        setRooms((prev) => prev.filter((r) => r !== selectedRoom));
        setSelectedRoom(null);
      } else {
        toast.error("Failed to clear this room");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
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

        <div style={{ marginTop: "10px", marginBottom: "15px" }}>
          <button
            onClick={clearAllChats}
            style={{
              width: "100%",
              padding: "8px",
              background: "#c62828",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            🧹 Clear All Chats
          </button>
          <button
            onClick={clearSelectedRoom}
            style={{
              width: "100%",
              padding: "8px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🧽 Clear This Room
          </button>
        </div>

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
