importScripts("/scram/scramjet.all.js");

// We need to initialize the worker with specific options to handle Google's complex JS
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

async function handleRequest(event) {
  // CRITICAL: Ensure config is loaded before any fetch happens
  await scramjet.loadConfig();
  
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }
  
  return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});
