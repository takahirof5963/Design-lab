/* 中学受験デザインラボ スケジューラー - オフライン対応 Service Worker */
var CACHE = 'tutor-sched-v1';

// インストール時：本体をキャッシュ
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(['./', './index.html']).catch(function () {});
    })
  );
});

// 有効化時：古いキャッシュを掃除
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) { if (k !== CACHE) return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// 取得時：ネット優先、失敗したらキャッシュ（network-first）
// これで更新は反映されつつ、オフラインでも開ける
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(e.request).then(function (m) {
          return m || caches.match('./index.html') || caches.match('./');
        });
      })
  );
});
