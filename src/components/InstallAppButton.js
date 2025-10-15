"use client";
import { useEffect, useState } from "react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect screen width (mobile layout)
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User response to install:", outcome);
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  // ✅ iPhone/iPad: show manual install hint
  if (isIos && !isStandalone) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          marginTop: "12px",
          transform: isMobile ? "translateX(-50px)" : "translateX(-140px)",
        }}
      >
        <div
          style={{
            backgroundColor: "#f5d67b",
            color: "#1f3b2e",
            borderRadius: "30px",
            padding: "14px 30px",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
            textAlign: "center",
          }}
        >
          📱 On iPhone: Tap{" "}
          <span style={{ fontWeight: "bold" }}>Share → Add to Home Screen</span>
        </div>
      </div>
    );
  }

  // ✅ Android/desktop: normal install button
  if (!isIos && canInstall) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          marginTop: "12px",
          transform: isMobile ? "translateX(-50px)" : "translateX(-140px)",
        }}
      >
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: "#f5d67b",
            color: "#1f3b2e",
            border: "none",
            borderRadius: "30px",
            padding: "14px 30px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "1rem",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          📱 Install Smart Companion
        </button>
      </div>
    );
  }

  return null;
}
