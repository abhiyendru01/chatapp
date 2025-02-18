self.addEventListener("push", (event) => {
    let data = event.data.json();
    const { title, body, icon, url } = data;
  
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon || "/stardust_appicon.png",  // Default icon for the notification
        tag: "chat-notification",  // Unique tag to avoid duplicate notifications
        data: { url: url },  // URL to navigate to when notification is clicked
      })
    );
  });
  
  self.addEventListener("notificationclick", (event) => {
    const { url } = event.notification.data;
    event.notification.close();
    event.waitUntil(self.clients.openWindow(url));
  });
  