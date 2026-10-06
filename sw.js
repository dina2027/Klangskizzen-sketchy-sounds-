/* =========================================================
   SERVICE WORKER – macht die App offline-fähig

   WICHTIG BEI JEDEM UPDATE:
   Die Versionsnummer unten um 1 erhöhen (v1 → v2 → v3 …).
   Nur dann holen sich die Geräte die neue Version.
   ========================================================= */

const VERSION = "klanglandschaft-v1";


/* Dateien, die sofort gespeichert werden */

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./grafiken/01-spirale.png",
  "./grafiken/02-knaeuel.png",
  "./grafiken/03-punktfeld.png",
  "./grafiken/04-zickzack.png",
  "./grafiken/05-welle.png",
  "./grafiken/06-schraffur.png",
  "./grafiken/07-ringe.png",
  "./grafiken/08-strahlen.png"
];


/* Installieren: App-Dateien speichern */

self.addEventListener("install", function (event) {

  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();

});


/* Aktivieren: alte Versionen löschen */

self.addEventListener("activate", function (event) {

  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== VERSION; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );

});


/* Abrufen:
   - Seite selbst: erst Netz (damit Updates ankommen), sonst Speicher
   - alles andere (Klänge, Bilder, Schrift): erst Speicher, sonst Netz
     und dabei für das nächste Mal merken */

self.addEventListener("fetch", function (event) {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {

    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put("./index.html", copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match("./index.html");
        })
    );

    return;

  }

  event.respondWith(

    caches.match(request).then(function (cached) {

      if (cached) {
        return cached;
      }

      return fetch(request).then(function (response) {

        if (response && (response.ok || response.type === "opaque")) {
          const copy = response.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(request, copy);
          });
        }

        return response;

      });

    })

  );

});
