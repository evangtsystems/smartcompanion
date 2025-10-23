"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import apiBaseUrl from "../config/api";
import { registerPush } from "../utils/push.js"; // ✅ add this import

export default function ChatbotWidget({ roomId }) {
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [resolvedRoomId, setResolvedRoomId] = useState(null);
  const chatEndRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0); // 🔴 new

  const handleOpenChat = () => {
  setShowChat(true);
  setUnreadCount(0); // clear badge when opening chat
};



  // 🏠 Resolve the room ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setResolvedRoomId(`villa-panorea-${room}`);
    } else {
      setResolvedRoomId(roomId || "villa-panorea");
    }
  }, [roomId]);


  // ✅ Add this function inside ChatbotWidget (before the Socket.IO useEffect)
async function registerPush(roomId) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const reg = await navigator.serviceWorker.ready;

  // Ask for permission
  let permission = Notification.permission;
  if (permission !== "granted") permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  // Convert VAPID key
  const vapidKey = "BI-FoW0_e5vandAAet46lR_CfzIOJxVVlMV-ArwBJNJExjS36_odKybOf9dgYjhi12JvgN4Q6yhnVkDKjBvea-0";
  const convertedKey = Uint8Array.from(
    atob(vapidKey.replace(/_/g, "/").replace(/-/g, "+")),
    (c) => c.charCodeAt(0)
  );

  // Create subscription if needed
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
  }

  // Send to backend
  try {
    await fetch(`${apiBaseUrl}/api/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, subscription: sub.toJSON() }),
    });
    console.log("✅ Push subscription registered for room:", roomId);
  } catch (err) {
    console.error("❌ Error registering push subscription:", err);
  }
}

  // 🟢 Connect to Socket.IO server once per room
  useEffect(() => {
    if (!resolvedRoomId) return;

    const s = io(apiBaseUrl, { transports: ["websocket"] });
    setSocket(s);

   s.on("connect", () => {
  console.log("✅ Guest connected to chat");
  s.emit("joinRoom", resolvedRoomId);
  // ✅ use the unified function
  registerPush(resolvedRoomId, "BI-FoW0_e5vandAAet46lR_CfzIOJxVVlMV-ArwBJNJExjS36_odKybOf9dgYjhi12JvgN4Q6yhnVkDKjBvea-0", apiBaseUrl);
  
});


    s.on("chatHistory", (history) => {
      setMessages(history);
    });

    // 🧩 Ensure chat is always up to date when reopening from push or cold start
(async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/api/chat/history/${resolvedRoomId}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.messages)) {
      const alreadyLoaded = new Set((messages || []).map((m) => m._id));
      const newMessages = data.messages.filter((m) => !alreadyLoaded.has(m._id));
      if (newMessages.length > 0) {
        console.log(`🔄 Synced ${newMessages.length} missed messages`);
        setMessages((prev) => [...prev, ...newMessages]);
      }
    }
  } catch (err) {
    console.error("❌ Chat resync failed:", err);
  }
})();


   s.on("newMessage", (msg) => {
  setMessages((prev) => [...prev, msg]);

  // 🔔 Host → guest message notification
  if (msg.sender !== "guest") {
    try {
      const audio = new Audio("/smile-ringtone.mp3");
      audio.play().catch(() => {
        const fallback = new Audio("/smile-ringtone.ogg");
        fallback.play().catch(() => {});
      });
    } catch (err) {
      console.warn("Sound play failed:", err);
    }

    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

    // 🔴 Show unread badge if chat window is closed
    if (!showChat) {
      setUnreadCount((prev) => prev + 1);
    }

    // 👁️ NEW → instantly mark this message as read if chat is open
    if (showChat && resolvedRoomId && s) {
      console.log("👁️ Auto-mark instantly as read:", msg._id);
      s.emit("markRead", {
        roomId: resolvedRoomId,
        messageIds: [msg._id],
        userType: "guest",
      });
    }
  }
});




    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, [resolvedRoomId]);


 // ✅ Automatically mark host messages as read when chat is open
// ✅ Automatically mark host messages as read when chat is open or when new messages arrive
useEffect(() => {
  if (!socket || !resolvedRoomId) return;

  // helper to emit markRead
  const markRead = (ids) => {
    if (ids && ids.length > 0) {
      console.log("👁️ Sending markRead for:", ids);
      socket.emit("markRead", {
        roomId: resolvedRoomId,
        messageIds: ids,
        userType: "guest",
      });
    }
  };

  // 🔹 Whenever chat opens or messages change
  if (showChat && messages.length > 0) {
    const unreadHost = messages.filter((m) => m.sender === "host" && !m.read);
    const ids = unreadHost.map((m) => m._id?.toString()).filter(Boolean);
    if (ids.length > 0) {
      // Small delay ensures latest message is included
      setTimeout(() => markRead(ids), 150);
    }
  }

  // 🔹 Also listen for new host messages while open
  const handleNewMessage = (msg) => {
    if (msg.sender === "host" && showChat) {
      console.log("👁️ Auto-mark single new message:", msg._id);
      setTimeout(() => {
        if (msg._id) markRead([msg._id.toString()]);
      }, 150);
    }
  };

  socket.on("newMessage", handleNewMessage);

  return () => socket.off("newMessage", handleNewMessage);
}, [socket, resolvedRoomId, showChat, messages]);





// ✅ Listen for read receipts from the server
useEffect(() => {
  if (!socket) return;

  socket.on("messagesRead", ({ messageIds, userType }) => {
    if (userType === "guest") {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id) ? { ...m, read: true } : m
        )
      );
    }
  });

  return () => socket.off("messagesRead");
}, [socket]);


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
  onClick={async () => {
  handleOpenChat(); // open the chat

  // ✅ Ask for notification permission *only once* per roomId
  try {
    const stored = localStorage.getItem("pushRegisteredFor");

    // Register push only if not already registered for this room
    if (stored !== resolvedRoomId) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        await registerPush(resolvedRoomId);
        localStorage.setItem("pushRegisteredFor", resolvedRoomId);
        console.log("✅ Push registered for", resolvedRoomId);
      } else {
        console.warn("🔕 Push permission denied or blocked");
      }
    } else {
      console.log("✅ Push already registered for", resolvedRoomId);
    }
  } catch (err) {
    console.error("❌ Push registration error:", err);
  }
}}


  style={{
    position: "relative",
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
  {/* 🔴 Unread message badge */}
  {unreadCount > 0 && (
    <div
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "#ff1744",
        color: "white",
        fontSize: "0.8rem",
        fontWeight: "700",
        borderRadius: "50%",
        width: "22px",
        height: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 6px rgba(0,0,0,0.2)",
      }}
    >
      {unreadCount}
    </div>
  )}

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

                    {/* ✅ Add this block below msg.text */}
        {isGuest && i === messages.length - 1 && msg.read && (
          <div style={{ fontSize: "0.75rem", color: "#d0ffd0", textAlign: "right", marginTop: "2px" }}>
            ✓ Seen
          </div>
        )}
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