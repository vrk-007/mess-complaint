"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onScan: (token: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<any>(null);
  const hasScannedRef = useRef(false); // prevent double-fire
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted) return;

        const scanner = new Html5Qrcode("qr-scanner-region");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            // Guard: only fire once, only for our token format
            if (hasScannedRef.current) return;
            if (!decodedText.startsWith("qr_")) return;

            hasScannedRef.current = true;

            // Stop the scanner FIRST, then defer onScan to next tick.
            // This prevents the race condition where React unmounts the
            // component while html5-qrcode is still tearing down the video DOM.
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                scannerRef.current = null;
                setTimeout(() => onScan(decodedText), 0);
              });
          },
          () => {} // ignore per-frame decode errors
        );
      } catch (err: any) {
        if (!mounted) return;
        if (err?.message?.includes("permission")) {
          setError("Camera permission denied. Please allow camera access and try again.");
        } else if (err?.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError("Could not start camera. Please try again.");
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      // Clean stop on unmount — safe even if already stopped
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []); // empty deps — scanner lifecycle tied to mount/unmount only

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch" as any,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          maxWidth: 360,
          width: "100%",
          margin: "auto",
          animation: "slideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: 4 }}>📷</div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "#431407" }}>
            Scan Mess QR
          </div>
          <div style={{ fontSize: "12px", color: "#78350f", marginTop: 3, fontWeight: 500 }}>
            Point at the coordinator&apos;s screen
          </div>
        </div>

        {/* Scanner viewport or error */}
        {error ? (
          <div
            style={{
              width: "100%",
              padding: "24px 16px",
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 14,
              color: "#b91c1c",
              fontSize: "13px",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              borderRadius: 16,
              overflow: "hidden",
              border: "2px solid #fed7aa",
              position: "relative",
              background: "#000",
            }}
          >
            {/* html5-qrcode mounts its video inside this div by ID */}
            <div id="qr-scanner-region" style={{ width: "100%" }} />

            {/* Decorative corner guides */}
            {(["topLeft", "topRight", "bottomLeft", "bottomRight"] as const).map((pos) => (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  width: 24,
                  height: 24,
                  borderColor: "#f97316",
                  borderStyle: "solid",
                  borderWidth: 0,
                  ...(pos === "topLeft"     && { top: 10, left: 10,  borderTopWidth: 3,    borderLeftWidth: 3 }),
                  ...(pos === "topRight"    && { top: 10, right: 10, borderTopWidth: 3,    borderRightWidth: 3 }),
                  ...(pos === "bottomLeft"  && { bottom: 10, left: 10,  borderBottomWidth: 3, borderLeftWidth: 3 }),
                  ...(pos === "bottomRight" && { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 }),
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "1.5px solid #fed7aa",
            background: "#fff7ed",
            color: "#9a3412",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        /* Hide html5-qrcode built-in UI chrome */
        #qr-scanner-region video  { width: 100% !important; }
        #qr-scanner-region img    { display: none !important; }
        #qr-scanner-region select { display: none !important; }
        #qr-scanner-region button { display: none !important; }
        #qr-scanner-region span   { display: none !important; }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
