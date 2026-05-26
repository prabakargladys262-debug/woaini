// ==========================================
// Service Worker: 后台保活 + 离线缓存 + 通知推送
// ==========================================
const CACHE_NAME = 'focus-timer-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.staticfile.net/echarts/5.4.3/echarts.min.js',
  'https://cdn.staticfile.net/localforage/1.10.0/localforage.min.js',
  'https://cdn.staticfile.net/Sortable/1.15.0/Sortable.min.js'
];

// ---- 安装：缓存核心资源 ----
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('部分资源缓存失败（CDN资源需联网首次加载）', err);
      });
    })
  );
});

// ---- 激活：清理旧缓存 ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ---- 拦截请求：优先网络，失败走缓存 ----
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求；API 调用（POST）直接放行
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功拿到网络响应，更新缓存
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // 离线时从缓存读取
        return caches.match(event.request).then(cached => {
          return cached || new Response('离线中，资源不可用', { status: 503 });
        });
      })
  );
});

// ---- 后台计时引擎 ----
let bgTimer = null;
let bgTimeLeft = 0;
let bgMode = 'idle'; // 'focus' | 'rest' | 'idle'
let bgSubject = '';
let bgCharName = '';

self.addEventListener('message', (event) => {
  const data = event.data;
  
  if (data.type === 'TIMER_START') {
    bgTimeLeft = data.timeLeft;
    bgMode = data.mode;
    bgSubject = data.subject || '';
    bgCharName = data.charName || '陪伴精灵';
    
    if (bgTimer) clearInterval(bgTimer);
    bgTimer = setInterval(() => {
      bgTimeLeft--;
      
      // 广播剩余时间给所有前端页面
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'TIMER_TICK', timeLeft: bgTimeLeft, mode: bgMode });
        });
      });
      
      if (bgTimeLeft <= 0) {
        clearInterval(bgTimer);
        bgTimer = null;
        
        // 发送通知
        if (bgMode === 'focus') {
          self.registration.showNotification('🎉 专注达成！', {
            body: `${bgSubject} 专注完成，开始休息吧！`,
            icon: 'icon-192x192.png',
            badge: 'icon-192x192.png',
            tag: 'focus-complete',
            requireInteraction: true,
            vibrate: [200, 100, 200]
          });
        } else if (bgMode === 'rest') {
          self.registration.showNotification('⏰ 休息结束！', {
            body: '准备好开始下一阶段的专注了吗？',
            icon: 'icon-192x192.png',
            badge: 'icon-192x192.png',
            tag: 'rest-complete',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200]
          });
        }
        
        // 通知前端计时结束
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'TIMER_END', mode: bgMode });
          });
        });
        
        bgMode = 'idle';
      }
    }, 1000);
  }
  
  else if (data.type === 'TIMER_PAUSE' || data.type === 'TIMER_STOP') {
    if (bgTimer) clearInterval(bgTimer);
    bgTimer = null;
    bgMode = 'idle';
  }
  
  else if (data.type === 'TIMER_SYNC') {
    // 前端请求同步当前状态
    event.source.postMessage({ 
      type: 'TIMER_STATE', 
      timeLeft: bgTimeLeft, 
      mode: bgMode 
    });
  }

  // 角色消息通知（后台时由前端请求 SW 发送）
  else if (data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(data.title || '消息', {
      body: data.body || '',
      icon: 'icon-192x192.png',
      badge: 'icon-192x192.png',
      tag: 'char-msg-' + Date.now(),
      data: { url: self.location.origin }
    });
  }
});

// ---- 点击通知：回到应用 ----
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // 如果已有窗口，聚焦它
      for (const client of clients) {
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      return self.clients.openWindow('./');
    })
  );
});
