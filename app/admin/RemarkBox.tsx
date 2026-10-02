"use client";

import { useState, useTransition } from "react";
import { updateComplaintRemark } from "@/app/actions/superadmin";

export default function RemarkBox({
  complaintId,
  existingRemark,
  remarkBy,
  remarkAt,
}: {
  complaintId: string;
  existingRemark?: string | null;
  remarkBy?: string | null;
  remarkAt?: Date | string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(existingRemark ?? "");
  const [saved, setSaved] = useState(existingRemark ?? "");
  const [savedBy, setSavedBy] = useState(remarkBy ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(
    remarkAt ? new Date(remarkAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateComplaintRemark(complaintId, text);
      if (result.success) {
        setSaved(text);
        setSavedAt(new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
        setEditing(false);
      } else {
        setError(result.error ?? "Failed to save remark.");
      }
    });
  }

  return (
    <div
      style={{
        borderTop: "1px solid rgba(249,115,22,0.12)",
        paddingTop: 14,
        marginTop: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          📝 Admin Remarks
        </span>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setText(saved); }}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#f97316",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: 6,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.08)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
          >
            {saved ? "✏️ Edit" : "＋ Add Remark"}
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={2}
            placeholder="e.g. Notice served to vendor, fine levied, inspection scheduled..."
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 10,
              border: "1.5px solid #fed7aa",
              fontSize: 13,
              fontFamily: "inherit",
              color: "#431407",
              background: "rgba(255,247,237,0.7)",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#f97316")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#fed7aa")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{text.length}/500</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setEditing(false); setError(null); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || text.trim().length < 2}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: isPending || text.trim().length < 2
                    ? "rgba(249,115,22,0.4)"
                    : "linear-gradient(135deg,#f97316,#ef4444)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: isPending || text.trim().length < 2 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 3px 10px rgba(249,115,22,0.25)",
                }}
              >
                {isPending ? (
                  <>
                    <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin-r 0.7s linear infinite" }} />
                    Saving…
                    <style>{`@keyframes spin-r { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : "💾 Save"}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ fontSize: 12, color: "#b91c1c", background: "#fef2f2", padding: "6px 10px", borderRadius: 8, border: "1px solid #fca5a5" }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      ) : saved ? (
        <div
          style={{
            background: "rgba(249,115,22,0.05)",
            border: "1px solid rgba(249,115,22,0.15)",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#431407", lineHeight: 1.55 }}>{saved}</p>
          {(savedBy || savedAt) && (
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9a3412", opacity: 0.7 }}>
              — {savedBy ? savedBy.split("@")[0] : "Admin"}
              {savedAt ? `, ${savedAt}` : ""}
            </p>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "#9a3412", opacity: 0.55, fontStyle: "italic", margin: 0 }}>
          No remarks yet.
        </p>
      )}
    </div>
  );
}
