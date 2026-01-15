/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options: NotificationOptions = {
      body: data.body || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Уведомление', options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data?.type === 'post' && data?.postId) {
    url = '/focus';
  } else if (data?.type === 'user' && data?.userId) {
    url = `/user/${data.userId}`;
  } else if (data?.type === 'notifications') {
    url = '/notifications';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle timer messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  if (type === 'TIMER_COMPLETE') {
    self.registration.showNotification(data.title || 'Таймер', {
      body: data.body || 'Время вышло!',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'timer',
      requireInteraction: true,
    });
  }
  
  if (type === 'POMODORO_PHASE_CHANGE') {
    const phaseMessages: Record<string, string> = {
      work: 'Время работать!',
      short_break: 'Короткий перерыв',
      long_break: 'Длинный перерыв',
    };
    
    self.registration.showNotification('Pomodoro Timer', {
      body: phaseMessages[data.phase] || 'Фаза изменена',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'pomodoro',
      requireInteraction: true,
    });
  }
});

export {};
