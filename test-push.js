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
  endpoint: "https://fcm.googleapis.com/fcm/send/eTkMNSoE9ik:APA91bGmTTBjXxLeIGlqNCKeqs1S1o_Lqu5nypMb3Y1k7tM5p-MDrVB70L86eCB5d2QMnuzja6o633Ffqbup7gU7Ey5c27xGrk5RxAt4Ep5xImVgSrTHqSPUfV2f7pqsMfoEZM4kiZJI",
  keys: {
    p256dh: "BPSh5d7V_8-uJueKOgT0qgH-7fTSVjuFoAODyUkIXr7_HXnVNiv3BMeo5sKKPTcnhBtvG0M3XEUA_yx4gmkq6iE",
    auth: "_blTDK-Y65AS6keQ0xMFwA",
  },
};

// ✅ Message payload
const payload = JSON.stringify({
  title: "Smart Companion",
  body: "🚀 This is a manual background push test!",
  url: "/villa/villa-panorea-106", // this will open when clicked
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
