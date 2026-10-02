"use client";

import { useTransition, useState } from "react";
import { approveResolution, rejectResolution } from "@/app/actions/admin";

export default function ApprovalActions({
  complaintId,
  resolvedBy,
  resolutionRemark,
}: {
  complaintId: string;
  resolvedBy?: string | null;
  resolutionRemark?: string | null;
}) {
  const [approvePending, startApprove] = useTransition();
  const [rejectPending, startReject] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startApprove(async () => {
      const res = await approveResolution(complaintId);
      if (!res.success) setError(res.error ?? "Failed to approve.");
    });
  }

  function handleReject() {
    setError(null);
    startReject(async () => {
      const res = await rejectResolution(complaintId);
      if (!res.success) setError(res.error ?? "Failed to reject.");
    });
  }

  const isAnyPending = approvePending || rejectPending;

  return (
    <div
      style={{
        background: "rgba(251,191,36,0.07)",
        border: "1.5px solid rgba(251,191,36,0.35)",
        borderRadius: 14,
        padding: "14px 16px",
        marginTop: 4,
      }}
    >
      {/* Pending label */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#92400e",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ⏳ RESOLUTION PENDING YOUR APPROVAL
      </div>

      {/* Who submitted + remark */}
      {resolutionRemark && (
        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#431407", lineHeight: 1.55 }}>
            {resolutionRemark}
          </p>
          {resolvedBy && (
            <p style={{ margin: "5px 0 0", fontSize: 11, color: "#9a3412", opacity: 0.75 }}>
              — Submitted by {resolvedBy.split("@")[0]}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            fontSize: 12,
            color: "#b91c1c",
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "6px 10px",
            marginBottom: 10,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Approve */}
        <button
          onClick={handleApprove}
          disabled={isAnyPending}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "none",
            background: isAnyPending
              ? "rgba(34,197,94,0.4)"
              : "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            cursor: isAnyPending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: !isAnyPending ? "0 3px 10px rgba(34,197,94,0.3)" : "none",
            opacity: rejectPending ? 0.5 : 1,
            transition: "all 0.2s",
          }}
        >
          {approvePending ? (
            <>
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin-ap 0.7s linear infinite",
                }}
              />
              Approving…
              <style>{`@keyframes spin-ap { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : (
            "✅ Approve & Resolve"
          )}
        </button>

        {/* Reject */}
        <button
          onClick={handleReject}
          disabled={isAnyPending}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "1.5px solid rgba(239,68,68,0.4)",
            background: "rgba(239,68,68,0.06)",
            color: "#b91c1c",
            fontWeight: 700,
            fontSize: 13,
            cursor: isAnyPending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            opacity: approvePending ? 0.5 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isAnyPending) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
          }}
        >
          {rejectPending ? (
            <>
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(185,28,28,0.35)",
                  borderTopColor: "#b91c1c",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin-rj 0.7s linear infinite",
                }}
              />
              Rejecting…
              <style>{`@keyframes spin-rj { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : (
            "❌ Reject"
          )}
        </button>
      </div>
    </div>
  );
}
