export function registerPwa() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    document.head.appendChild(manifest);
  }

  if (!document.querySelector('meta[name="theme-color"]')) {
    const themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    themeColor.content = "#050505";
    document.head.appendChild(themeColor);
  }

  const installServiceWorker = () => {
    void navigator.serviceWorker.register("/sw.js");
  };

  if ("serviceWorker" in navigator) {
    if (document.readyState === "complete") {
      installServiceWorker();
    } else {
      window.addEventListener("load", installServiceWorker, { once: true });
    }
  }
}
