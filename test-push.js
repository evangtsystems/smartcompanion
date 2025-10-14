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
  endpoint: "https://fcm.googleapis.com/fcm/send/cTHD5GfRgL4:APA91bGwe50nB-QpnV8iqt88wuftgnLazzKIKshCdDQICIfdxHNxB1T_XuabAAHIEZAff0X5Ii58kPfY9RQANTWPVBObzSE3wgHxJfEYOQ2kh8vHfvf4u3RQQlvZZHtnbwtOLAOfxI0i",
  keys: {
    p256dh: "BFdjDFCLY8uPiTcJf4WQnTEsuSjyH20mWAssFCXzT-I6X_RjWnfAIdhiPuIMOpcOixkQQ3JS0y3kO9s1N7Be6A4",
    auth: "W-Optmyi8nt3HgScfPdBHg"
  }
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
