"use client";

import { useState, useTransition } from "react";
import { requestResolve } from "@/app/actions/admin";

export default function ResolveModal({
  complaintId,
}: {
  complaintId: string;
}) {
  const [open, setOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setRemark("");
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await requestResolve(complaintId, remark);
      if (res.success) {
        setOpen(false);
        setRemark("");
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="btn-primary"
        style={{
          padding: "8px 20px",
          fontSize: "13px",
          gap: 8,
          minWidth: 160,
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        ✅ Resolve
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          {/* Modal Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fffaf5",
              border: "1.5px solid #fed7aa",
              borderRadius: 20,
              padding: "28px 28px 24px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 60px rgba(249,115,22,0.18), 0 4px 16px rgba(0,0,0,0.12)",
              animation: "modal-pop 0.25s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <style>{`
              @keyframes modal-pop {
                from { opacity: 0; transform: scale(0.92) translateY(8px); }
                to   { opacity: 1; transform: scale(1)    translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                  flexShrink: 0,
                }}
              >
                ✅
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#431407" }}>
                  Submit for Approval
                </div>
                <div style={{ fontSize: 12, color: "#9a3412", opacity: 0.75, marginTop: 2 }}>
                  Describe the action taken — an approver will review and finalize.
                </div>
              </div>
            </div>

            {/* Remark Textarea */}
            <textarea
              autoFocus
              value={remark}
              onChange={(e) => setRemark(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="e.g. Vendor warned, utensils replaced, kitchen inspected on 2 Oct 2026…"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid #fed7aa",
                fontSize: 14,
                fontFamily: "inherit",
                color: "#431407",
                background: "rgba(255,247,237,0.8)",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
                marginBottom: 6,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#fed7aa")}
            />
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14, textAlign: "right" }}>
              {remark.length}/500
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 14,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={handleClose}
                disabled={isPending}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || remark.trim().length < 2}
                style={{
                  padding: "9px 22px",
                  borderRadius: 10,
                  border: "none",
                  background:
                    isPending || remark.trim().length < 2
                      ? "rgba(249,115,22,0.4)"
                      : "linear-gradient(135deg,#f97316,#ef4444)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: isPending || remark.trim().length < 2 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  boxShadow:
                    remark.trim().length >= 2 && !isPending
                      ? "0 4px 14px rgba(249,115,22,0.35)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {isPending ? (
                  <>
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin-m 0.7s linear infinite",
                      }}
                    />
                    Submitting…
                    <style>{`@keyframes spin-m { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : (
                  "📤 Submit for Approval"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
