// Activate new service worker immediately (great for development)
self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing...");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activated.");
    event.waitUntil(self.clients.claim());
  });
  
  // Handle push event
  self.addEventListener("push", (event) => {
    console.log("[Service Worker] Push Received.");
    
    let data = {};
    try {
      data = event.data?.json() || {};
    } catch (e) {
      console.error("Push event data parsing error:", e);
    }
  
    const title = data.title || "New Notification";
    const options = {
      body: data.body || "You have a new message.",
      icon: data.icon || "/logo192.png", // fallback to React logo
      data: {
        url: data.data?.url || "/", // fallback to home
      },
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Handle click on notification
  self.addEventListener("notificationclick", (event) => {
    console.log("[Service Worker] Notification clicked.");
    event.notification.close();
  
    const targetUrl = event.notification.data?.url || "/";
  
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  });
  