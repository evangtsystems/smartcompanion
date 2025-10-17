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
  endpoint: "https://fcm.googleapis.com/fcm/send/cQb6oJq_j0U:APA91bGvprHdWAWi67f9-B9ftH2GZ6FWU1yE3SQcB-2-626v5hoGP9_tU_94wcFOEpoIOeOV3Z90ZGy3iC5M0BLEP8kTgN2bsFv9Tt2f5hwuanrQR5wepiqEZdBtOMpZfdRNiK-SBNZx",
  keys: {
    p256dh: "BOCUW6kkatA6CqTxtyZh0Uk2dT_zZoJBQcinMC2_5i5JHGI5-_NimNOc_7nQQbB9eAwnFRREL-wgxo-6yZTXJOM",
    auth: "W206oWJMKVcShBHvY_oR5Q"
  }
};



const payload = JSON.stringify({
  notification: {
    title: "Smart Companion",
    body: "🚀 This is a manual background push test!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    data: { url: "/villa/villa-panorea-103" },
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
