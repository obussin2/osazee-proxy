"use strict";
const stockSW = "./sw.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    ) throw new Error("Service workers require HTTPS.");
    throw new Error("Your browser doesn't support service workers.");
  }

  // Register the SW
  const reg = await navigator.serviceWorker.register(stockSW, { scope: "/" });

  // Wait for it to be active
  if (!reg.active) {
    await new Promise((resolve) => {
      const sw = reg.installing || reg.waiting;
      if (sw) {
        sw.addEventListener("statechange", function onState() {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", onState);
            resolve();
          }
        });
      } else {
        navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
      }
      // Fallback
      setTimeout(resolve, 4000);
    });
  }

  // Wait for SW to actually control this page — this is what prevents MessagePort error
  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
      setTimeout(resolve, 3000);
    });
  }
}
