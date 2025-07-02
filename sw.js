const CACHE_NAME = 'calculator-v1';
const urlsToCache = [
    './', // index.html
    './index.html',
    './style.css',
    './script.js',
    './images/icon-192x192.png', // manifest.jsonで指定したアイコン
    './images/icon-512x512.png'  // manifest.jsonで指定したアイコン
];

// インストールイベント: キャッシュにファイルを保存
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// フェッチイベント: リクエストを傍受し、キャッシュまたはネットワークから応答
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにリソースがあればそれを使用
                if (response) {
                    return response;
                }
                // なければネットワークから取得
                return fetch(event.request)
                    .then((networkResponse) => {
                        // 取得したリソースをキャッシュに追加（任意）
                        // ここでは常にネットワークから取得し、キャッシュに追加するシンプルな戦略
                        // return caches.open(CACHE_NAME).then(function(cache) {
                        //     cache.put(event.request, networkResponse.clone());
                        //     return networkResponse;
                        // });
                        return networkResponse;
                    })
                    .catch(() => {
                        // ネットワークエラーの場合のフォールバック
                        // 例えば、オフラインページを返すなど
                        // return caches.match('/offline.html');
                        console.log('Fetch failed for:', event.request.url);
                        return new Response('<h1>Offline</h1><p>You are offline and this content is not cached.</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
            })
    );
});

// アクティベートイベント: 古いキャッシュのクリーンアップ
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
