self.addEventListener('push', event => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/vite.svg', 
    badge: '/vite.svg',
    data: data
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Xử lý khi user click vào notification
  event.waitUntil(
    clients.openWindow('http://localhost:5173') 
  );
});