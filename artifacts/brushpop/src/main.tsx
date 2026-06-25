import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// On every app launch, ask the active service worker to check the server for
// a newer version. Combined with skipWaiting + clientsClaim already set in the
// workbox config, this means any downloaded update activates on the very next
// page load — no tab-close required.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.update())
      .catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
