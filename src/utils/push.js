// ✅ src/utils/push.js

function urlBase64ToUint8Array(base64String) {
  if (!base64String) throw new Error("Missing VAPID public key");
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function registerPush(roomId, publicKey, apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin)
 {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const vapidKey =
      publicKey ||
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      "BI-FoW0_e5vandAAet46lR_CfzIOJxVVlMV-ArwBJNJExjS36_odKybOf9dgYjhi12JvgN4Q6yhnVkDKjBvea-0"; // fallback

    const registration = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    localStorage.setItem("pushSub", JSON.stringify(subscription.toJSON()));

    await fetch(`${apiBaseUrl}/api/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: roomId || "global",
        subscription: subscription.toJSON(),
      }),
    });

    console.log("✅ Push subscription active for:", roomId || "global");
  } catch (err) {
    console.error("❌ Push registration failed:", err);
  }
}

// ✅ Make available in browser console
if (typeof window !== "undefined") {
  window.registerPush = registerPush;
}

