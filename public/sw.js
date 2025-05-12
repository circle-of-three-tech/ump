self.addEventListener('push', event => {
  if (!event.data) return;

  const { title, message, icon, data } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = '/notifications';

  // Determine the URL based on notification type
  if (notificationData) {
    switch (notificationData.type) {
      case 'MESSAGE':
        url = `/messages?userId=${notificationData.senderId}`;
        break;
      case 'LISTING_UPDATE':
      case 'LIKE':
      case 'COMMENT':
        url = `/listings/${notificationData.listingId}`;
        break;
      case 'FOLLOW':
        url = `/profile/${notificationData.senderId}`;
        break;
      case 'TRANSACTION':
        url = `/transactions/${notificationData.transactionId}`;
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If a tab is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', event => {
  self.skipWaiting();
});