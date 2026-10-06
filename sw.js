/* =========================================================
   SERVICE WORKER – macht die App offline-fähig

   WICHTIG BEI JEDEM UPDATE:
   VERSION_NUMMER unten um 1 erhöhen (v2 → v3 → v4 …).
   Nur dann holen sich die Geräte die neue Version.
   ========================================================= */

const VERSION_NUMMER = "v3";


/* Jedes Repository bekommt seinen eigenen Speicher –
   so stören sich mehrere Klanglandschaften unter
   dina2027.github.io nicht gegenseitig. */

const PREFIX = "klanglandschaft:" + self.registration.scope + ":";
const VERSION = PREFIX + VERSION_NUMMER;


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


/* Klänge – werden einzeln gespeichert. Fehlt einer,
   läuft die App trotzdem (er wird dann beim ersten
   Abspielen geladen). */

const SOUND_FILES = [
  "./klaenge/21kb808-bd01.wav.mp3",
  "./klaenge/24kb808-hh03.wav.mp3",
  "./klaenge/34kb808-sd02.wav.mp3",
  "./klaenge/44kb808-tme3.wav.mp3",
  "./klaenge/45kb808-cme1.wav.mp3",
  "./klaenge/54kb808-thi3.wav.mp3",
  "./klaenge/67kb808-clap4.wav.mp3",
  "./klaenge/367kb808-cym05.wav.mp3"
];


/* Installieren: App-Dateien speichern */

self.addEventListener("install", function (event) {

  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(APP_FILES).then(function () {
        return Promise.all(
          SOUND_FILES.map(function (file) {
            return cache.add(file).catch(function () {});
          })
        );
      });
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
          .filter(function (key) {
            /* alte Versionen DIESER App löschen … */
            if (key.indexOf(PREFIX) === 0 && key !== VERSION) {
              return true;
            }
            /* … und den Speicher der allerersten Version (v1) */
            return /^klanglandschaft-v\d+$/.test(key);
          })
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
