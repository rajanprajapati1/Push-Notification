"use client";

import { useEffect } from "react";

const VAPID_PUBLIC_KEY = "BK__k52G6H-H9aqpOPg_j0KGfMEXpR7wE1G0vMhzwsZQ5M_jeydSzg56RnX3hzfrsXfoZfJa0g-FMnwCjXnBvEA"

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export default function PushManager() {
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!("serviceWorker" in navigator)) {
        console.log("Service workers not supported");
        return;
      }

      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);

      if (permission !== "granted") {
        alert("You need to allow notifications to receive push messages.");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log("Push subscription:", subscription);

        const res = await fetch("/api/push", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("Server response:", data);
      } catch (err) {
        console.error("Push notification setup error:", err);
      }
    };

    setupPushNotifications();
  }, []);

  return null;
}
