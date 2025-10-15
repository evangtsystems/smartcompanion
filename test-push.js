// test-push.js — send manual web push notification

import webpush from "web-push";

// ✅ Use your real VAPID keys from .env
const VAPID_PUBLIC_KEY = "BI-FoW0_e5vandAAet46lR_CfzIOJxVVlMV-ArwBJNJExjS36_odKybOf9dgYjhi12JvgN4Q6yhnVkDKjBvea-0";
const VAPID_PRIVATE_KEY = "-nfe3If7BpzP8qUH9aADuKb_VIPrwem74P0rlPTSDA8";

webpush.setVapidDetails(
  "mailto:info@smartcompanion.app", // arbitrary email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// ✅ Replace these values with what you have in MongoDB (from PushSubscription)
const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/e9-TNMlZsRU:APA91bFyMDQHK_25AuFms05h4BGsw75LkDN-ZqCERn9IMuyBeWyNJ5GA4-QM6AFBObh8tUKdxBbgk3F_mmXfMBzvvjjBC6RE1K15FMbSJ4YScZBvw0NPnLp9XPdyojfNLa4fWXQiYR5w",
  keys: {
    p256dh: "BFdjDFCLY8uPiTcJf4WQnTEsuSjyH20mWAssFCXzT-I6X_RjWnfAIdhiPuIMOpcOixkQQ3JS0y3kO9s1N7Be6A4",
    auth: "W-Optmyi8nt3HgScfPdBHg"
  }
};


const payload = JSON.stringify({
  notification: {
    title: "Smart Companion",
    body: "🚀 This is a manual background push test!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    data: { url: "/villa/villa-panorea-102" },
  },
});


// ✅ Send the push
(async () => {
  try {
    await webpush.sendNotification(subscription, payload);
    console.log("✅ Push notification sent successfully!");
  } catch (err) {
    console.error("❌ Push error:", err);
  }
})();
