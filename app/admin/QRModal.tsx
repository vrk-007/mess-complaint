"use client";

import { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createQRToken } from "@/app/actions/qrToken";

export default function QRModal() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = useCallback(async () => {
    setLoading(true);
    setOpen(true);
    try {
      const { token: newToken } = await createQRToken();
      setToken(newToken);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setToken(null);
  }, []);

  return (
    <>
      {/* Trigger button in the navbar */}
      <button
        onClick={handleOpen}
        title="Show QR for student complaint"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 10,
          border: "1.5px solid #fed7aa",
          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
          boxShadow: "0 2px 8px rgba(249,115,22,0.1)",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "13px",
          color: "#9a3412",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 14px rgba(249,115,22,0.25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 2px 8px rgba(249,115,22,0.1)";
        }}
      >
        <span style={{ fontSize: "16px" }}>📱</span>
        QR Code
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: "36px 32px",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(249,115,22,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              maxWidth: 340,
              width: "100%",
              animation: "slideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: 6 }}>📱</div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#431407",
                  letterSpacing: "-0.01em",
                }}
              >
                Mess Authority QR
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#78350f",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                Ask the student to scan this QR
              </div>
            </div>

            {/* QR Box */}
            <div
              style={{
                padding: 16,
                background: "#fff",
                border: "2px solid #fed7aa",
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(249,115,22,0.1)",
              }}
            >
              {loading || !token ? (
                <div
                  style={{
                    width: 200,
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 12,
                    color: "#9a3412",
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      border: "3px solid #fed7aa",
                      borderTopColor: "#f97316",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>
                    Generating…
                  </span>
                </div>
              ) : (
                <QRCodeSVG
                  value={token}
                  size={200}
                  level="H"
                  fgColor="#431407"
                  bgColor="#ffffff"
                />
              )}
            </div>

            {/* Status */}
            {token && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#15803d",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                    animation: "pulse 1.5s ease infinite",
                  }}
                />
                Active &amp; Ready — 1 use only
              </div>
            )}

            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </>
  );
}
