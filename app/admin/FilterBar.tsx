"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

const MESS_OPTIONS = ["Swadanand Mess", "Aaswad Mess", "VNIT Canteen", "Ruchira Mess"];

const PERIOD_OPTIONS = [
  { label: "All",     value: "" },
  { label: "1 Week",  value: "1w" },
  { label: "2 Weeks", value: "2w" },
  { label: "1 Month", value: "1m" },
];

const SHARED_STYLES = `
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
  .fb-pill:hover:not(:disabled) { background: #fff7ed; border-color: #fb923c; color: #c2410c; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,0.15); }
  .fb-pill:active:not(:disabled) { transform: translateY(0px) scale(0.97); transition-duration: 0.08s; }
  .fb-pill.active { background: linear-gradient(135deg, #f97316, #ef4444); color: #fff; border-color: #f97316; box-shadow: 0 5px 16px rgba(249,115,22,0.38); transform: translateY(-1px); }
  .fb-pill.active:hover { box-shadow: 0 7px 20px rgba(249,115,22,0.48); }
  .fb-date {
    width: 100%; padding: 9px 12px; font-size: 13px; border-radius: 12px; border: 1.5px solid #fed7aa;
    background: rgba(255,255,255,0.85); color: #431407; font-weight: 600; font-family: inherit;
    cursor: pointer; outline: none; transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1); box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .fb-date:hover { border-color: #fb923c; background: #fff7ed; box-shadow: 0 4px 14px rgba(249,115,22,0.12); }
  .fb-date:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }

  /* Mess card (shared with superadmin style) */
  .fb-mess-card {
    background: rgba(255,255,255,0.88); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,237,213,0.95); border-radius: 18px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    box-shadow: 0 6px 24px rgba(120,53,15,0.07); flex-wrap: wrap;
  }
  .fb-mess-card-label { font-size: 13px; font-weight: 700; color: #9a3412; white-space: nowrap; }
  .fb-mess-big-select {
    flex: 1; min-width: 180px; padding: 11px 14px; font-size: 14px; border-radius: 12px;
    border: 1.5px solid #fed7aa; background: rgba(255,255,255,0.95); color: #431407;
    font-weight: 700; font-family: inherit; cursor: pointer; outline: none;
    transition: all 0.22s cubic-bezier(0.22,1,0.36,1); box-shadow: 0 2px 8px rgba(249,115,22,0.08);
  }
  .fb-mess-big-select:hover { border-color: #fb923c; background: #fff7ed; }
  .fb-mess-big-select:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.18); }

  @keyframes fb-spin { to { transform: rotate(360deg); } }
  @keyframes fb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }

  @media (max-width: 480px) {
    .fb-mess-card { flex-direction: column; align-items: stretch; gap: 10px; }
    .fb-mess-big-select { min-width: unset; width: 100%; }
  }
`;

export default function FilterBar({ section = "mess" }: { section?: "mess" | "filters" }) {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [optMess,   setOptMess]   = useState(searchParams.get("mess")   ?? "");
  const [optPeriod, setOptPeriod] = useState(searchParams.get("period") ?? "");
  const [optDate,   setOptDate]   = useState(searchParams.get("date")   ?? "");

  useEffect(() => { setOptMess(searchParams.get("mess") ?? "");   }, [searchParams]);
  useEffect(() => { setOptPeriod(searchParams.get("period") ?? ""); }, [searchParams]);
  useEffect(() => { setOptDate(searchParams.get("date") ?? "");   }, [searchParams]);

  const update = useCallback(
    (key: string, value: string) => {
      if (key === "mess") {
        setOptMess(value);
        if (value === "VNIT Canteen") { setOptPeriod(""); setOptDate(""); }
      }
      if (key === "period") { setOptPeriod(value); setOptDate(""); }
      if (key === "date")   { setOptDate(value);   setOptPeriod(""); }

      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      if (key === "mess" && value === "VNIT Canteen") { params.delete("period"); params.delete("date"); }
      if (key === "period") params.delete("date");
      if (key === "date")   params.delete("period");

      startTransition(() => { router.push(`/admin?${params.toString()}`); });
    },
    [router, searchParams]
  );

  /* ── Section: prominent mess selector card ─── */
  if (section === "mess") {
    return (
      <>
        <style>{SHARED_STYLES}</style>
        <div className="fb-mess-card">
          <span className="fb-mess-card-label">🍽️ Select Mess</span>
          <select
            id="mess-filter"
            value={optMess}
            onChange={(e) => update("mess", e.target.value)}
            className="fb-mess-big-select"
          >
            <option value="">— All Messes —</option>
            {MESS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {optMess && (
            <button
              onClick={() => update("mess", "")}
              title="Clear mess filter"
              style={{
                background: "rgba(249,115,22,0.08)", border: "1.5px solid rgba(249,115,22,0.25)",
                borderRadius: 10, cursor: "pointer", fontSize: 12, color: "#9a3412",
                fontWeight: 700, padding: "8px 14px", whiteSpace: "nowrap",
                transition: "all 0.18s", flexShrink: 0,
              }}
            >
              ✕ Clear
            </button>
          )}
          {isPending && (
            <span style={{
              width: 14, height: 14,
              border: "2px solid rgba(249,115,22,0.25)", borderTopColor: "#f97316",
              borderRadius: "50%", display: "inline-block",
              animation: "fb-spin 0.65s linear infinite", flexShrink: 0,
            }} />
          )}
        </div>
      </>
    );
  }

  /* ── Section: period pills + date picker only ─── */
  return (
    <>
      <style>{SHARED_STYLES}</style>
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
          animation: isPending ? "fb-pulse 1.2s ease-in-out infinite" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
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

        {isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9a3412", fontSize: "12px", fontWeight: 600, opacity: 0.8 }}>
            <span style={{
              width: 12, height: 12,
              border: "2px solid rgba(249,115,22,0.25)", borderTopColor: "#f97316",
              borderRadius: "50%", display: "inline-block",
              animation: "fb-spin 0.65s linear infinite",
            }} />
            Updating...
          </div>
        )}
      </div>
    </>
  );
}
