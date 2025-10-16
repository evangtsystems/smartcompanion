"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";

export default function QrScannerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
  let scanner;
  let isMounted = true;

  async function initScanner() {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!isMounted || !open) return;

      // 🎯 Prefer the back camera (if available)
      const backCamera = devices.find((d) =>
        d.label.toLowerCase().includes("back")
      );
      const cameraId = backCamera ? backCamera.id : devices[0]?.id;

      if (!cameraId) {
        toast.error("No camera found.");
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scanner = html5QrCode;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          toast.success("QR detected — redirecting...");
          setOpen(false);

          // ✅ Normalize scanned link (works for both absolute + relative URLs)
          let url = decodedText.trim();
          if (!url.startsWith("http")) {
            url = `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
          }

          // ✅ Redirect safely
          window.location.href = url;
        },
        (error) => {
          console.warn("QR scan error:", error);
        }
      );
    } catch (err) {
      console.error("Camera initialization error:", err);
      toast.error("Unable to access camera. Check permissions.");
    }
  }

  if (open) initScanner();

  return () => {
    isMounted = false;
    if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
  };
}, [open]);


  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "#1f3b2e",
          color: "#fff9b0",
          border: "none",
          borderRadius: "10px",
          padding: "12px 20px",
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        📷 Scan QR Code
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              width: "90%",
              maxWidth: "360px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#1f3b2e", marginBottom: "10px" }}>
              Scan Your QR Code
            </h3>

            <div id="qr-reader" style={{ width: "100%" }} />

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: "15px",
                background: "#c62828",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
