"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import apiBaseUrl from "../../../src/config/api";
import toast from "react-hot-toast";
import { registerPush } from "../../../src/utils/push.js";

export default function AdminChatDashboard() {
  const socketRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false); // ✅ for mobile toggle
  const [readIds, setReadIds] = useState(new Set());

  const defaultRooms = Array.from({ length: 7 }, (_, i) => `Room ${i + 1}`);

  // ✅ Socket setup
  useEffect(() => {
    if (socketRef.current) return;

    const s = io(apiBaseUrl, { transports: ["websocket"] });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("👑 Connected as Admin");
      s.emit("adminJoin");
      registerPush("global");
    });

    const expectedRooms = [
  "villa-panorea-101",
  "villa-panorea-102",
  "villa-panorea-103",
  "villa-panorea-104",
  "villa-panorea-105",
  "villa-panorea-106",
  "villa-panorea-107",
];

function ensureAllRooms(incomingRooms) {
  // Create a list that always includes all expected rooms
  // but uses backend names if they exist
  const set = new Set([...incomingRooms, ...expectedRooms]);
  return expectedRooms.map((r) => (set.has(r) ? r : r));
}

s.on("roomsList", (list) => setRooms(ensureAllRooms(list)));
s.on("updateRooms", (list) => setRooms(ensureAllRooms(list)));


    s.on("chatHistory", (history) => setMessages(history));

    s.on("newMessage", (msg) => {
  setMessages((prev) => {
    // 🧩 Replace local temp message (same text+sender+room)
    const idx = prev.findIndex(
      (m) =>
        m.sender === msg.sender &&
        m.roomId === msg.roomId &&
        m.text === msg.text &&
        String(m._id).startsWith("1") // temp IDs like Date.now()
    );

    if (idx !== -1) {
      const clone = [...prev];
      clone[idx] = msg; // replace with real backend message
      return clone;
    }

    // otherwise, handle as usual
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

    // ✅ Listen for "messagesRead" events (guest opened the chat)









    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

 useEffect(() => {
  const s = socketRef.current;
  if (!s) return;

  const handleMessagesRead = ({ messageIds, userType, roomId }) => {
    console.log("📩 messagesRead event:", { messageIds, userType, roomId, selectedRoom });

    if (userType !== "guest") return;
    if (roomId && roomId !== selectedRoom) return;
    if (!Array.isArray(messageIds) || messageIds.length === 0) return;

    setMessages((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        const matched = messageIds.some((id) => id.toString() === m._id?.toString());
        if (matched && !m.read) {
          changed = true;
          return { ...m, read: true, _refresh: Date.now() }; // 🟢 forces React re-render
        }
        return m;
      });

      if (changed) {
        console.log("✅ Marked messages as read:", messageIds);
        return [...updated]; // force rerender
      } else {
        console.log("ℹ️ No messages matched but forcing refresh");
        return [...prev]; // still force a re-render to update ✓ Seen
      }
    });

    setReadIds((prev) => {
      const next = new Set(prev);
      messageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  s.on("messagesRead", handleMessagesRead);
  return () => s.off("messagesRead", handleMessagesRead);
}, [selectedRoom]);





  // 🏠 Join room
  const joinRoom = (roomId) => {
    const socket = socketRef.current;
    if (!socket) return;
    setSelectedRoom(roomId);
    setNotifications((prev) => ({ ...prev, [roomId]: 0 }));
    socket.emit("joinRoom", roomId);
    setShowSidebar(false); // ✅ auto-close sidebar on mobile
  };

  // 💬 Send message
  const sendMessage = (e) => {
  e.preventDefault();
  const socket = socketRef.current;
  if (!message.trim() || !socket || !selectedRoom) return;

  const tempId = Date.now().toString(); // ✅ temporary ID
  const localMsg = {
    _id: tempId,
    roomId: selectedRoom,
    sender: "host",
    text: message,
    timestamp: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, localMsg]);

  socket.emit("sendMessage", {
    _id: tempId, // ✅ send to backend so IDs align
    roomId: selectedRoom,
    sender: "host",
    text: message,
  });

  setMessage("");
};


  // 🧹 Clear chats
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
      toast.error("Server error");
    }
  };

  // 🧽 Clear selected room
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
      toast.error("Server error");
    }
  };

  // 📱 Detect small screens
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

 return (
  <div
    style={{
      display: "flex",
      height: "100vh",
      fontFamily: "'Poppins', sans-serif",
      background: "#f7f7e6",
      flexDirection: isMobile ? "column" : "row",
      overflow: "hidden",
    }}
  >
    {/* Sidebar toggle for mobile */}
    {isMobile && (
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          background: "#1f3b2e",
          color: "#fff9b0",
          border: "none",
          padding: "10px 15px",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          width: "100%",
          zIndex: 3,
        }}
      >
        {showSidebar ? "Close Rooms ▲" : "Show Rooms ▼"}
      </button>
    )}

    {/* Sidebar */}
    <div
      style={{
        width: isMobile ? "100%" : "260px",
        background: "#fff9b0",
        padding: "15px",
        boxShadow: isMobile ? "none" : "2px 0 8px rgba(0,0,0,0.1)",
        overflowY: "auto",
        display: isMobile && !showSidebar ? "none" : "block",
        flexShrink: 0,
        zIndex: 2,
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#1f3b2e",
          fontSize: isMobile ? "1.1rem" : "1.3rem",
        }}
      >
        💬 Active Rooms
      </h2>

      <div style={{ marginTop: "10px", marginBottom: "15px" }}>
        <button
          onClick={clearAllChats}
          style={{
            width: "100%",
            padding: isMobile ? "6px" : "8px",
            background: "#c62828",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "6px",
            fontSize: isMobile ? "0.85rem" : "0.95rem",
          }}
        >
          🧹 Clear All Chats
        </button>
        <button
          onClick={clearSelectedRoom}
          style={{
            width: "100%",
            padding: isMobile ? "6px" : "8px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: isMobile ? "0.85rem" : "0.95rem",
          }}
        >
          🧽 Clear This Room
        </button>
      </div>

     {(rooms.length === 0 ? defaultRooms : rooms).map((room) => (
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
      fontSize: isMobile ? "0.9rem" : "1rem",
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
          fontSize: "0.75em",
        }}
      >
        {notifications[room]}
      </span>
    )}
  </div>
))}

    </div>

    {/* Chat Window */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#1f3b2e",
          color: "#fff9b0",
          padding: "10px",
          textAlign: "center",
          fontWeight: "bold",
          letterSpacing: "0.5px",
          fontSize: isMobile ? "0.95rem" : "1rem",
          flexShrink: 0,
        }}
      >
        {selectedRoom ? `Chat with ${selectedRoom}` : "Select a room to chat"}
      </div>

      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          background: "#fffdf2",
          paddingBottom: "70px", // ✅ room for input bar
        }}
      >
        {messages.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
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
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  background: msg.sender === "host" ? "#1f3b2e" : "#fff7b3",
                  color: msg.sender === "host" ? "#fff9b0" : "#1f3b2e",
                  padding: isMobile ? "8px 10px" : "10px 14px",
                  borderRadius: "10px",
                  maxWidth: "75%",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                {msg.text}

               {msg.sender === "host" && (msg.read || readIds.has(msg._id)) && (

  <div
    style={{
      fontSize: "0.75rem",
      color: "#c1ffc1",
      textAlign: "right",
      marginTop: "3px",
    }}
  >
    ✓ Seen
  </div>
)}

              </div>
            </div>
          ))
        )}
      </div>

      {selectedRoom && (
        <form
          onSubmit={sendMessage}
          style={{
            position: "fixed", // ✅ always visible
            bottom: 0,
            left: isMobile ? 0 : "260px",
            right: 0,
            display: "flex",
            padding: "10px",
            background: "#fff9b0",
            borderTop: "1px solid #ddd",
            alignItems: "center",
            zIndex: 3,
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
              padding: "10px 12px",
              outline: "none",
              background: "#fff",
              fontSize: isMobile ? "0.9rem" : "0.95rem",
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
              fontSize: isMobile ? "0.9rem" : "1rem",
              height: "40px",
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