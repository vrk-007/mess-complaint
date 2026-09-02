"use client";

import { useTransition } from "react";

export default function ResolveButton({
  complaintId,
  resolveAction,
}: {
  complaintId: string;
  resolveAction: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => resolveAction(complaintId))}
      className="btn-primary"
      style={{
        padding: "8px 20px",
        fontSize: "13px",
        gap: 8,
        minWidth: 160,
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "white",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
              flexShrink: 0,
            }}
          />
          Resolving…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        "✅ Mark as Resolved"
      )}
    </button>
  );
}
