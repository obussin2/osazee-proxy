"use strict";

const UV_SW = "/uv/sw.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    ) throw new Error("Service workers require HTTPS.");
    throw new Error("Your browser doesn't support service workers.");
  }

  // Unregister any old stale service workers (scramjet etc)
  const existing = await navigator.serviceWorker.getRegistrations();
  for (const reg of existing) {
    const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
    if (!url.includes("/uv/sw.js")) {
      console.log("[Kairo] Removing stale SW:", url);
      await reg.unregister();
    }
  }

  // Register UV SW
  const reg = await navigator.serviceWorker.register(UV_SW, { scope: "/uv/" });

  // Wait for it to be active and controlling
  await new Promise((resolve) => {
    if (reg.active) { resolve(); return; }
    const sw = reg.installing || reg.waiting;
    if (sw) {
      sw.addEventListener("statechange", function handler() {
        if (sw.state === "activated") {
          sw.removeEventListener("statechange", handler);
          resolve();
        }
      });
    } else {
      // Already installed — wait for controllerchange
      navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
    }
    // Fallback — don't wait forever
    setTimeout(resolve, 3000);
  });
}
