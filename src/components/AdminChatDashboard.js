"use client";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import apiBaseUrl from "../config/api";
import toast from "react-hot-toast";

export default function AdminChatDashboard() {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // 🟢 Connect to Socket.IO
  useEffect(() => {
    const newSocket = io(apiBaseUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Admin connected");
      newSocket.emit("adminJoin");
    });

    newSocket.on("roomsList", (list) => setRooms(list));
    newSocket.on("updateRooms", (list) => setRooms(list));

    newSocket.on("chatHistory", (history) => {
      setMessages(history);
    });

    newSocket.on("newMessage", (msg) => {
      if (msg.roomId === activeRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => newSocket.close();
  }, [activeRoom]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectRoom = (room) => {
    if (!socket) return;
    setActiveRoom(room);
    setMessages([]);
    socket.emit("joinRoom", room);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !activeRoom) return;

    const msg = {
      roomId: activeRoom,
      sender: "host",
      text: input.trim(),
    };

    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  // 🧹 Clear all chat messages
  const handleClearAllChats = async () => {
    if (!window.confirm("Are you sure you want to delete ALL chat history?")) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/chat/delete-all`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success(`Deleted ${data.deletedCount} chat messages`);
        setMessages([]);
        setRooms([]);
      } else {
        toast.error("Failed to delete chats");
      }
    } catch (err) {
      console.error("Error deleting chats:", err);
      toast.error("Server error");
    }
  };

  const formatRoomName = (room) => {
    if (room === "villa-panorea") return "Villa Panorea";
    if (room.startsWith("villa-panorea-")) {
      const number = room.split("villa-panorea-")[1];
      return `Room ${number}`;
    }
    return room;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Poppins', sans-serif",
        background: "#fffbee",
      }}
    >
      {/* 🧭 Sidebar */}
      <div
        style={{
          width: "260px",
          background: "#1f3b2e",
          color: "#fff",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "15px", color: "#fff9c4" }}>
          🏡 Chats
        </h2>

        {/* Clear All Chats Button */}
        <button
          onClick={handleClearAllChats}
          style={{
            background: "#c62828",
            color: "white",
            padding: "8px 12px",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.2s",
            marginBottom: "15px",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#b71c1c")}
          onMouseLeave={(e) => (e.target.style.background = "#c62828")}
        >
          🧹 Clear All Chats
        </button>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {rooms.length === 0 && (
            <p style={{ color: "#ccc", textAlign: "center" }}>No active chats</p>
          )}
          {rooms.map((room) => (
            <div
              key={room}
              onClick={() => handleSelectRoom(room)}
              style={{
                background: activeRoom === room ? "#fff9c4" : "transparent",
                color: activeRoom === room ? "#1f3b2e" : "#fff",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "6px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {formatRoomName(room)}
            </div>
          ))}
        </div>
      </div>

      {/* 💬 Chat Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fffdf5",
        }}
      >
        <div
          style={{
            background: "#fff9c4",
            padding: "12px 20px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            borderBottom: "1px solid #eee",
          }}
        >
          {activeRoom
            ? `💬 Chat with ${formatRoomName(activeRoom)}`
            : "Select a room to start chatting"}
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            background: "#fffef7",
          }}
        >
          {activeRoom && messages.length === 0 && (
            <p style={{ textAlign: "center", color: "#777" }}>No messages yet...</p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.sender === "host" ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: msg.sender === "host" ? "#1f3b2e" : "#fff7b3",
                  color: msg.sender === "host" ? "#fff" : "#333",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  maxWidth: "70%",
                  fontSize: "0.95rem",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {activeRoom && (
          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              padding: "10px",
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
                padding: "10px 12px",
                outline: "none",
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
                marginLeft: "8px",
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
