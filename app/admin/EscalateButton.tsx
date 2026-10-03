"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { escalateComplaint } from "@/app/actions/superadmin";

export default function EscalateButton({ complaintId, isAlreadyForwarded, forwardedBy, forwardNote }: {
  complaintId: string;
  isAlreadyForwarded: boolean;
  forwardedBy?: string | null;
  forwardNote?: string | null;
}) {
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(isAlreadyForwarded);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showModal && textareaRef.current) textareaRef.current.focus();
  }, [showModal]);

  if (done) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 20,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          fontSize: "12px",
          fontWeight: 700,
          color: "#b91c1c",
        }}
        title={forwardNote ? `Note: ${forwardNote}` : undefined}
      >
        🚨 Escalated to SuperAdmin
      </div>
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await escalateComplaint(complaintId, note);
      if (result.success) {
        setDone(true);
        setShowModal(false);
      } else {
        setError(result.error ?? "Failed to escalate.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          padding: "8px 18px",
          borderRadius: 10,
          border: "1.5px solid rgba(239,68,68,0.4)",
          background: "rgba(239,68,68,0.06)",
          color: "#b91c1c",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.6)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(239,68,68,0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        🚨 Escalate to SuperAdmin
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "28px",
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              animation: "escalate-pop 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <style>{`@keyframes escalate-pop { from { opacity:0; transform: scale(0.92); } to { opacity:1; transform: scale(1); } }`}</style>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 28 }}>🚨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a1a" }}>Escalate to SuperAdmin</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  Serious complaints will be visible to the SuperAdmin portal.
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                Reason / Note <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional, max 300 chars)</span>
              </label>
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                placeholder="e.g. Foreign object found in food, repeated hygiene violation..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "#111827",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#ef4444")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 4 }}>
                {note.length}/300
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 13, color: "#b91c1c", marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowModal(false); setError(null); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: isPending ? "#fca5a5" : "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isPending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: isPending ? "none" : "0 4px 14px rgba(239,68,68,0.35)",
                }}
              >
                {isPending ? (
                  <>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Escalating…
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : "🚨 Confirm Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
