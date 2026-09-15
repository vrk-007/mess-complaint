"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

const MESS_OPTIONS = ["Swadanand Mess", "Aaswad Mess", "Main Canteen"];

const PERIOD_OPTIONS = [
  { label: "All",      value: "" },
  { label: "1 Week",   value: "1w" },
  { label: "2 Weeks",  value: "2w" },
  { label: "1 Month",  value: "1m" },
];

export default function FilterBar() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── Optimistic state: switches instantly on click, syncs from URL ──
  const [optMess,   setOptMess]   = useState(searchParams.get("mess")   ?? "");
  const [optPeriod, setOptPeriod] = useState(searchParams.get("period") ?? "");
  const [optDate,   setOptDate]   = useState(searchParams.get("date")   ?? "");

  // Keep optimistic state in sync if URL changes externally (e.g. back button)
  useEffect(() => { setOptMess(searchParams.get("mess") ?? ""); },   [searchParams]);
  useEffect(() => { setOptPeriod(searchParams.get("period") ?? ""); }, [searchParams]);
  useEffect(() => { setOptDate(searchParams.get("date") ?? ""); },   [searchParams]);

  const update = useCallback(
    (key: string, value: string) => {
      // 1️⃣ Optimistically update UI instantly
      if (key === "mess")   setOptMess(value);
      if (key === "period") { setOptPeriod(value); setOptDate(""); }
      if (key === "date")   { setOptDate(value);   setOptPeriod(""); }

      // 2️⃣ Then push to server in background
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      if (key === "period") params.delete("date");
      if (key === "date")   params.delete("period");

      startTransition(() => { router.push(`/admin?${params.toString()}`); });
    },
    [router, searchParams]
  );

  return (
    <>
      <style>{`
        .fb-pill {
          padding: 9px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid #fed7aa;
          cursor: pointer;
          background: rgba(255,255,255,0.8);
          color: #78350f;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
          flex: 1 1 auto;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .fb-pill:hover:not(:disabled) {
          background: #fff7ed;
          border-color: #fb923c;
          color: #c2410c;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(249,115,22,0.15);
        }
        .fb-pill:active:not(:disabled) {
          transform: translateY(0px) scale(0.97);
          transition-duration: 0.08s;
        }
        .fb-pill.active {
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: #fff;
          border-color: #f97316;
          box-shadow: 0 5px 16px rgba(249,115,22,0.38);
          transform: translateY(-1px);
        }
        .fb-pill.active:hover {
          box-shadow: 0 7px 20px rgba(249,115,22,0.48);
        }
        .fb-select {
          width: 100%;
          padding: 9px 12px;
          font-size: 13px;
          border-radius: 12px;
          border: 1.5px solid #fed7aa;
          background: rgba(255,255,255,0.85);
          color: #431407;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .fb-select:hover {
          border-color: #fb923c;
          background: #fff7ed;
          box-shadow: 0 4px 14px rgba(249,115,22,0.12);
        }
        .fb-select:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
        }
        .fb-date {
          width: 100%;
          padding: 9px 12px;
          font-size: 13px;
          border-radius: 12px;
          border: 1.5px solid #fed7aa;
          background: rgba(255,255,255,0.85);
          color: #431407;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .fb-date:hover {
          border-color: #fb923c;
          background: #fff7ed;
          box-shadow: 0 4px 14px rgba(249,115,22,0.12);
        }
        .fb-date:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
        }
        @keyframes fb-spin { to { transform: rotate(360deg); } }
        @keyframes fb-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
      `}</style>

      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 237, 213, 0.95)",
          borderRadius: 24,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          boxShadow: "0 10px 40px rgba(120, 53, 15, 0.07)",
          // Pulse subtly while fetching, but don't disappear
          animation: isPending ? "fb-pulse 1.2s ease-in-out infinite" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* 🍽️ Mess Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 180 }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#9a3412", whiteSpace: "nowrap" }}>
            🍽️ Mess:
          </span>
          <select
            id="mess-filter"
            value={optMess}
            onChange={(e) => update("mess", e.target.value)}
            className="fb-select"
          >
            <option value="">All Messes</option>
            {MESS_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* ⏱ Period Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "1 1 auto" }}>
          {PERIOD_OPTIONS.map(({ label, value }) => {
            const isActive = !optDate && optPeriod === value;
            return (
              <button
                key={value}
                id={`period-filter-${value || "all"}`}
                onClick={() => update("period", value)}
                className={`fb-pill${isActive ? " active" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 📅 Date Picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto", minWidth: 170 }}>
          <span style={{ fontSize: "14px" }}>📅</span>
          <input
            id="date-filter"
            type="date"
            value={optDate}
            onChange={(e) => update("date", e.target.value)}
            className="fb-date"
            style={optDate ? { borderColor: "#f97316", boxShadow: "0 0 0 3px rgba(249,115,22,0.15)" } : {}}
          />
          {optDate && (
            <button
              onClick={() => update("date", "")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 16, color: "#9a3412", padding: "2px 4px", lineHeight: 1,
                borderRadius: 6, transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#9a3412"; }}
              title="Clear date"
            >
              ✕
            </button>
          )}
        </div>

        {/* Loading dot — subtle, in-bar indicator */}
        {isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9a3412", fontSize: "12px", fontWeight: 600, opacity: 0.8 }}>
            <span style={{
              width: 12, height: 12,
              border: "2px solid rgba(249,115,22,0.25)",
              borderTopColor: "#f97316",
              borderRadius: "50%",
              display: "inline-block",
              animation: "fb-spin 0.65s linear infinite",
            }} />
            Updating…
          </div>
        )}
      </div>
    </>
  );
}
