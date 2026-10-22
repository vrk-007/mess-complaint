"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

const MESS_OPTIONS = ["Swadanand Mess", "Aaswad Mess", "VNIT Canteen", "Ruchira Mess"];

const PERIOD_OPTIONS = [
  { label: "All",     value: "" },
  { label: "1 Wk",   value: "1w" },
  { label: "2 Wks",  value: "2w" },
  { label: "1 Month", value: "1m" },
];

const SHARED_STYLES = `
  .sa-pill {
    padding: 8px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    border: 1.5px solid #fed7aa;
    cursor: pointer;
    background: rgba(255,255,255,0.8);
    color: #78350f;
    transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
    white-space: nowrap;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    flex-shrink: 0;
  }
  .sa-pill:hover { background: #fff7ed; border-color: #fb923c; color: #c2410c; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,0.15); }
  .sa-pill:active { transform: translateY(0) scale(0.97); transition-duration: 0.08s; }
  .sa-pill.active { background: linear-gradient(135deg,#f97316,#ef4444); color: #fff; border-color: #f97316; box-shadow: 0 5px 16px rgba(249,115,22,0.38); transform: translateY(-1px); }
  .sa-select {
    padding: 8px 10px; font-size: 13px; border-radius: 12px; border: 1.5px solid #fed7aa;
    background: rgba(255,255,255,0.85); color: #431407; font-weight: 600; font-family: inherit;
    cursor: pointer; outline: none; transition: all 0.22s cubic-bezier(0.22,1,0.36,1); box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .sa-select:hover { border-color: #fb923c; background: #fff7ed; }
  .sa-select:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
  .sa-date {
    flex: 1; min-width: 0; padding: 8px 10px; font-size: 13px; border-radius: 12px; border: 1.5px solid #fed7aa;
    background: rgba(255,255,255,0.85); color: #431407; font-weight: 600; font-family: inherit;
    cursor: pointer; outline: none; transition: all 0.22s cubic-bezier(0.22,1,0.36,1); box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .sa-date:hover { border-color: #fb923c; background: #fff7ed; }
  .sa-date:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
  .sa-filterbar {
    background: rgba(255,255,255,0.8); backdrop-filter: blur(24px); border: 1px solid rgba(255,237,213,0.95);
    border-radius: 24px; padding: 12px 16px; display: flex; align-items: center; gap: 10px;
    flex-wrap: nowrap; box-shadow: 0 10px 40px rgba(120,53,15,0.07); transition: box-shadow 0.3s ease; overflow-x: auto;
  }
  .sa-filterbar.loading { animation: sa-pulse 1.2s ease-in-out infinite; }
  .sa-group { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .sa-group-label { font-size: 12px; font-weight: 700; color: #9a3412; white-space: nowrap; }
  .sa-pills { display: flex; gap: 6px; flex-shrink: 0; }
  .sa-divider { width: 1px; height: 28px; background: rgba(254,215,170,0.7); flex-shrink: 0; }
  .sa-date-group { display: flex; align-items: center; gap: 6px; flex: 1 1 120px; min-width: 120px; }
  @keyframes sa-spin  { to { transform: rotate(360deg); } }
  @keyframes sa-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }

  /* Mess card */
  .sa-mess-card {
    background: rgba(255,255,255,0.88); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,237,213,0.95); border-radius: 18px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    box-shadow: 0 6px 24px rgba(120,53,15,0.07); flex-wrap: wrap;
  }
  .sa-mess-card-label { font-size: 13px; font-weight: 700; color: #9a3412; white-space: nowrap; }
  .sa-mess-big-select {
    flex: 1; min-width: 180px; padding: 11px 14px; font-size: 14px; border-radius: 12px;
    border: 1.5px solid #fed7aa; background: rgba(255,255,255,0.95); color: #431407;
    font-weight: 700; font-family: inherit; cursor: pointer; outline: none;
    transition: all 0.22s cubic-bezier(0.22,1,0.36,1); box-shadow: 0 2px 8px rgba(249,115,22,0.08);
  }
  .sa-mess-big-select:hover { border-color: #fb923c; background: #fff7ed; }
  .sa-mess-big-select:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.18); }

  @media (max-width: 680px) {
    .sa-filterbar { flex-wrap: wrap; gap: 10px; }
    .sa-group { flex: 1 1 calc(50% - 10px); min-width: 130px; }
    .sa-group .sa-select { width: 100%; }
    .sa-divider { display: none; }
    .sa-pills { flex-wrap: wrap; flex: 1 1 100%; justify-content: space-between; }
    .sa-pill { flex: 1 1 auto; }
    .sa-date-group { flex: 1 1 100%; }
  }
  @media (max-width: 480px) {
    .sa-mess-card { flex-direction: column; align-items: stretch; gap: 10px; }
    .sa-mess-big-select { min-width: unset; width: 100%; }
  }
`;

export default function SuperAdminFilterBar({
  viewAll,
  section = "mess",
}: {
  viewAll: boolean;
  section?: "mess" | "filters";
}) {
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
      if (key === "mess") {
        setOptMess(value);
        if (value === "VNIT Canteen") { setOptStatus(""); setOptPeriod(""); setOptDate(""); }
      }
      if (key === "status") setOptStatus(value);
      if (key === "period") { setOptPeriod(value); setOptDate(""); }
      if (key === "date")   { setOptDate(value);   setOptPeriod(""); }

      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      if (key === "mess" && value === "VNIT Canteen") { params.delete("status"); params.delete("period"); params.delete("date"); }
      if (key === "period") params.delete("date");
      if (key === "date")   params.delete("period");

      startTransition(() => { router.push(`/superadmin?${params.toString()}`); });
    },
    [router, searchParams]
  );

  /* ── Section: prominent mess selector card ─── */
  if (section === "mess") {
    return (
      <>
        <style>{SHARED_STYLES}</style>
        <div className="sa-mess-card">
          <span className="sa-mess-card-label">🍽️ Select Mess</span>
          <select
            id="sa-mess-filter"
            value={optMess}
            onChange={(e) => update("mess", e.target.value)}
            className="sa-mess-big-select"
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
              animation: "sa-spin 0.65s linear infinite", flexShrink: 0,
            }} />
          )}
        </div>
      </>
    );
  }

  /* ── Section: status / period / date filters only ─── */
  return (
    <>
      <style>{SHARED_STYLES}</style>
      <div className={`sa-filterbar${isPending ? " loading" : ""}`}>

        {/* 📌 Status */}
        <div className="sa-group">
          <span className="sa-group-label">📌 Status</span>
          <select
            id="sa-status-filter"
            value={optStatus}
            onChange={(e) => update("status", e.target.value)}
            className="sa-select"
            style={{ width: 118 }}
          >
            <option value="">All</option>
            <option value="pending">⏳ Pending</option>
            <option value="resolved">✅ Resolved</option>
          </select>
        </div>

        <div className="sa-divider" />

        {/* ⏱ Period Pills */}
        <div className="sa-pills">
          {PERIOD_OPTIONS.map(({ label, value }) => {
            const isActive = !optDate && optPeriod === value;
            return (
              <button
                key={value}
                id={`sa-period-${value || "all"}`}
                onClick={() => update("period", value)}
                className={`sa-pill${isActive ? " active" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="sa-divider" />

        {/* 📅 Date Picker */}
        <div className="sa-date-group">
          <span style={{ fontSize: 15, flexShrink: 0 }}>📅</span>
          <input
            id="sa-date-filter"
            type="date"
            value={optDate}
            onChange={(e) => update("date", e.target.value)}
            className="sa-date"
            style={optDate ? { borderColor: "#f97316", boxShadow: "0 0 0 3px rgba(249,115,22,0.15)" } : {}}
          />
          {optDate && (
            <button
              onClick={() => update("date", "")}
              title="Clear date"
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 15, color: "#9a3412", padding: "2px 4px",
                lineHeight: 1, borderRadius: 6, flexShrink: 0, transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#9a3412"; }}
            >
              ✕
            </button>
          )}
        </div>

        {isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9a3412", fontSize: "12px", fontWeight: 600, opacity: 0.8, flexShrink: 0 }}>
            <span style={{
              width: 12, height: 12,
              border: "2px solid rgba(249,115,22,0.25)", borderTopColor: "#f97316",
              borderRadius: "50%", display: "inline-block",
              animation: "sa-spin 0.65s linear infinite",
            }} />
            Updating…
          </div>
        )}
      </div>
    </>
  );
}
