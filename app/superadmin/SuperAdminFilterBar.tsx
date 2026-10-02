"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

const MESS_OPTIONS = ["Swadanand Mess", "Aaswad Mess", "Main Canteen"];

const PERIOD_OPTIONS = [
  { label: "All",     value: "" },
  { label: "1 Week",  value: "1w" },
  { label: "2 Weeks", value: "2w" },
  { label: "1 Month", value: "1m" },
];

export default function SuperAdminFilterBar({ viewAll }: { viewAll: boolean }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [optMess,   setOptMess]   = useState(searchParams.get("mess")   ?? "");
  const [optStatus, setOptStatus] = useState(searchParams.get("status") ?? "");
  const [optPeriod, setOptPeriod] = useState(searchParams.get("period") ?? "");
  const [optDate,   setOptDate]   = useState(searchParams.get("date")   ?? "");

  useEffect(() => { setOptMess(searchParams.get("mess")     ?? ""); }, [searchParams]);
  useEffect(() => { setOptStatus(searchParams.get("status") ?? ""); }, [searchParams]);
  useEffect(() => { setOptPeriod(searchParams.get("period") ?? ""); }, [searchParams]);
  useEffect(() => { setOptDate(searchParams.get("date")     ?? ""); }, [searchParams]);

  const update = useCallback(
    (key: string, value: string) => {
      if (key === "mess")   setOptMess(value);
      if (key === "status") setOptStatus(value);
      if (key === "period") { setOptPeriod(value); setOptDate(""); }
      if (key === "date")   { setOptDate(value);   setOptPeriod(""); }

      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      if (key === "period") params.delete("date");
      if (key === "date")   params.delete("period");

      startTransition(() => { router.push(`/superadmin?${params.toString()}`); });
    },
    [router, searchParams]
  );

  return (
    <>
      <style>{`
        .sa-pill {
          padding: 9px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid #f5d0fe;
          cursor: pointer;
          background: rgba(255,255,255,0.8);
          color: #581c87;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
          flex: 1 1 auto;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .sa-pill:hover:not(:disabled) {
          background: #faf5ff;
          border-color: #a855f7;
          color: #7e22ce;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(168,85,247,0.15);
        }
        .sa-pill.active {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: #fff;
          border-color: #a855f7;
          box-shadow: 0 5px 16px rgba(168,85,247,0.38);
          transform: translateY(-1px);
        }
        .sa-select {
          width: 100%;
          padding: 9px 12px;
          font-size: 13px;
          border-radius: 12px;
          border: 1.5px solid #f5d0fe;
          background: rgba(255,255,255,0.85);
          color: #3b0764;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: all 0.22s;
        }
        .sa-select:hover { border-color: #a855f7; background: #faf5ff; }
        .sa-select:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
        .sa-date {
          width: 100%;
          padding: 9px 12px;
          font-size: 13px;
          border-radius: 12px;
          border: 1.5px solid #f5d0fe;
          background: rgba(255,255,255,0.85);
          color: #3b0764;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: all 0.22s;
        }
        .sa-date:hover { border-color: #a855f7; }
        .sa-date:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
        @keyframes sa-spin { to { transform: rotate(360deg); } }
        @keyframes sa-pulse { 0%, 100% { opacity:1; } 50% { opacity: 0.55; } }
      `}</style>

      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(245,208,254,0.95)",
          borderRadius: 24,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          boxShadow: "0 10px 40px rgba(88,28,135,0.07)",
          animation: isPending ? "sa-pulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        {/* Mess */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 180 }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#7e22ce", whiteSpace: "nowrap" }}>🍽️ Mess:</span>
          <select value={optMess} onChange={(e) => update("mess", e.target.value)} className="sa-select">
            <option value="">All Messes</option>
            {MESS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 180 }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#7e22ce", whiteSpace: "nowrap" }}>📌 Status:</span>
          <select value={optStatus} onChange={(e) => update("status", e.target.value)} className="sa-select">
            <option value="">All</option>
            <option value="pending">⏳ Pending</option>
            <option value="resolved">✅ Resolved</option>
          </select>
        </div>

        {/* Period Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "1 1 auto" }}>
          {PERIOD_OPTIONS.map(({ label, value }) => {
            const isActive = !optDate && optPeriod === value;
            return (
              <button
                key={value}
                onClick={() => update("period", value)}
                className={`sa-pill${isActive ? " active" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Date Picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto", minWidth: 170 }}>
          <span style={{ fontSize: "14px" }}>📅</span>
          <input
            type="date"
            value={optDate}
            onChange={(e) => update("date", e.target.value)}
            className="sa-date"
            style={optDate ? { borderColor: "#a855f7", boxShadow: "0 0 0 3px rgba(168,85,247,0.15)" } : {}}
          />
          {optDate && (
            <button
              onClick={() => update("date", "")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#7e22ce", padding: "2px 4px", lineHeight: 1, borderRadius: 6 }}
              title="Clear date"
            >
              ✕
            </button>
          )}
        </div>

        {isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7e22ce", fontSize: "12px", fontWeight: 600, opacity: 0.8 }}>
            <span style={{ width: 12, height: 12, border: "2px solid rgba(168,85,247,0.25)", borderTopColor: "#a855f7", borderRadius: "50%", display: "inline-block", animation: "sa-spin 0.65s linear infinite" }} />
            Updating…
          </div>
        )}
      </div>
    </>
  );
}
