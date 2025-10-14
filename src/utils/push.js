// src/utils/push.js
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function registerPush(roomId, publicKey, apiBaseUrl) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // 🧩 Store in localStorage so it persists across pages
    localStorage.setItem('pushSub', JSON.stringify(subscription.toJSON()));

    // Always update the server with current room (if any)
    await fetch(`${apiBaseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: roomId || 'global', subscription }),
    });

    console.log('✅ Push subscription active for:', roomId || 'global');
  } catch (err) {
    console.error('❌ Push registration failed:', err);
  }
}

