// キャッシュ名とキャッシュするファイルのリストを定義
const CACHE_NAME = 'calculator-v1';
const urlsToCache = [
    './', // アプリのルートパス (index.htmlを指すことが多い)
    './index.html',
    './style.css',
    './app.js', // ファイル名をscript.jsからapp.jsに変更
    './manifest.json', // manifest.jsonもキャッシュ
    './images/icon-192x192.png', // manifest.jsonで指定したアイコン
    './images/icon-512x512.png'  // manifest.jsonで指定したアイコン
];

// インストールイベント: Service Workerがインストールされるときに発生
self.addEventListener('install', (event) => {
    // インストール処理が完了するまで待機
    event.waitUntil(
        // 指定したキャッシュ名でキャッシュを開く
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('キャッシュを開きました');
                // キャッシュにすべてのファイルを一括で追加
                return cache.addAll(urlsToCache);
            })
    );
});

// フェッチイベント: アプリがリソースを要求するたびに発生
self.addEventListener('fetch', (event) => {
    // リクエストに応答
    event.respondWith(
        // キャッシュにリクエストされたリソースがあるか確認
        caches.match(event.request)
            .then((response) => {
                // キャッシュにリソースがあれば、それを返す
                if (response) {
                    return response;
                }
                // キャッシュになければ、ネットワークからリソースを取得
                return fetch(event.request)
                    .then((networkResponse) => {
                        // ネットワークからの応答を返す
                        return networkResponse;
                    })
                    .catch(() => {
                        // ネットワークエラーが発生した場合のフォールバック
                        // 例: オフラインページを返す、またはエラーメッセージを表示
                        console.log('フェッチに失敗しました:', event.request.url);
                        return new Response('<h1>オフライン</h1><p>現在オフラインです。このコンテンツはキャッシュされていません。</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
            })
    );
});

// アクティベートイベント: Service Workerがアクティブ化されるときに発生
self.addEventListener('activate', (event) => {
    // 古いキャッシュをクリーンアップ
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 現在のキャッシュ名と異なるキャッシュを削除
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除しています:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
