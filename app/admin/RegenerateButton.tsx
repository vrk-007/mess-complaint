"use client";

import { useTransition } from "react";
import { regenerateCode } from "@/app/actions/dailyCode";

export default function RegenerateButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await regenerateCode();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Regenerate today's code"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "1px solid #fed7aa",
        background: isPending ? "#fff7ed" : "transparent",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
        flexShrink: 0,
        fontSize: "14px",
        transition: "background 0.15s ease",
      }}
    >
      {isPending ? (
        <span
          style={{
            width: 12,
            height: 12,
            border: "2px solid #fed7aa",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
      ) : (
        "🔄"
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
