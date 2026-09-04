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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 10,
        border: "1.5px solid #fed7aa",
        background: isPending ? "#fff7ed" : "white",
        color: "#9a3412",
        fontWeight: 700,
        fontSize: "13px",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.7 : 1,
        transition: "all 0.2s ease",
      }}
    >
      {isPending ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: "2px solid #fed7aa",
              borderTopColor: "#f97316",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }}
          />
          Regenerating…
        </>
      ) : (
        <>🔄 Regenerate Code</>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
