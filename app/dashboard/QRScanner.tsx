"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (token: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        // Dynamically import html5-qrcode only on the client
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted || !containerRef.current) return;

        const scanner = new Html5Qrcode("qr-scanner-region");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // prefer rear camera
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            // Only accept tokens that look like our tokens
            if (decodedText.startsWith("qr_")) {
              scanner.stop().catch(() => {});
              onScan(decodedText);
            }
          },
          () => {} // ignore frame errors silently
        );
      } catch (err: any) {
        if (mounted) {
          setError(
            err?.message?.includes("permission")
              ? "Camera permission denied. Please allow camera access and try again."
              : "Could not start camera. Please try again."
          );
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
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
          animation: "slideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: 4 }}>📷</div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "#431407" }}>
            Scan Mess QR
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#78350f",
              marginTop: 3,
              fontWeight: 500,
            }}
          >
            Point at the coordinator&apos;s screen
          </div>
        </div>

        {/* Scanner viewport */}
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
            <div id="qr-scanner-region" ref={containerRef} style={{ width: "100%" }} />
            {/* Corner guides */}
            {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  width: 24,
                  height: 24,
                  borderColor: "#f97316",
                  borderStyle: "solid",
                  borderWidth: 0,
                  ...(pos === "topLeft"     && { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 }),
                  ...(pos === "topRight"    && { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 }),
                  ...(pos === "bottomLeft"  && { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 }),
                  ...(pos === "bottomRight" && { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 }),
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        )}

        {/* Cancel button */}
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
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        /* Hide html5-qrcode default UI noise */
        #qr-scanner-region video { width: 100% !important; }
        #qr-scanner-region img { display: none !important; }
        #qr-scanner-region select { display: none !important; }
        #qr-scanner-region button { display: none !important; }
        #qr-scanner-region span { display: none !important; }
      `}</style>
    </div>
  );
}
