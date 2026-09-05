"use client";

import { useState, useTransition } from "react";
import { regenerateCode } from "@/app/actions/dailyCode";

export default function DailyCodeBadge({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [isPending, startTransition] = useTransition();

  function handleRegenerate() {
    startTransition(async () => {
      const newCode = await regenerateCode();
      setCode(newCode);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
        border: "1.5px solid #fed7aa",
        borderRadius: 10,
        padding: "5px 12px 5px 10px",
        boxShadow: "0 2px 8px rgba(249,115,22,0.1)",
      }}
    >
      <span style={{ fontSize: "14px" }}>🔐</span>
      <div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#9a3412",
            letterSpacing: "0.05em",
            lineHeight: 1.2,
          }}
        >
          TODAY&apos;S CODE
        </div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 900,
            fontFamily: "monospace",
            color: "#431407",
            letterSpacing: "4px",
            lineHeight: 1.2,
            transition: "opacity 0.15s ease",
            opacity: isPending ? 0.4 : 1,
          }}
        >
          {code}
        </div>
      </div>

      {/* Regenerate icon button */}
      <button
        onClick={handleRegenerate}
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
    </div>
  );
}
