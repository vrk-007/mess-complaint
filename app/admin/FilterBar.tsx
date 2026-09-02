"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const MESS_OPTIONS = [
  "Swadanand Mess",
  "Aaswad Mess",
];

const PERIOD_OPTIONS = [
  { label: "All Complaints", value: "" },
  { label: "Past 1 Week",    value: "1w" },
  { label: "Past 2 Weeks",   value: "2w" },
  { label: "Past 1 Month",   value: "1m" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMess   = searchParams.get("mess")   ?? "";
  const currentPeriod = searchParams.get("period") ?? "";
  const currentDate   = searchParams.get("date")   ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // When switching to a period button, clear the custom date picker
      if (key === "period") params.delete("date");
      // When picking a date, clear the period buttons
      if (key === "date")   params.delete("period");
      router.push(`/admin?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeBtn = (cond: boolean) => ({
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid",
    cursor: "pointer",
    background: cond ? "linear-gradient(135deg,#f97316,#ef4444)" : "rgba(255,255,255,0.7)",
    color: cond ? "#ffffff" : "#78350f",
    borderColor: cond ? "#f97316" : "#fed7aa",
    transition: "all 0.18s ease",
    whiteSpace: "nowrap" as const,
    boxShadow: cond ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
  });

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 237, 213, 0.9)",
        borderRadius: 24,
        padding: "16px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        boxShadow: "0 10px 40px rgba(120, 53, 15, 0.06)",
      }}
    >
      {/* 🍽️ Mess Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: "200px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#9a3412", whiteSpace: "nowrap" }}>
          🍽️ Mess:
        </span>
        <select
          id="mess-filter"
          value={currentMess}
          onChange={(e) => update("mess", e.target.value)}
          className="input"
          style={{ width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "12px" }}
        >
          <option value="">All Messes</option>
          {MESS_OPTIONS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* ⏱ Period Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "1 1 auto" }}>
        {PERIOD_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            id={`period-filter-${value || "all"}`}
            onClick={() => update("period", value)}
            style={{
              ...activeBtn(!currentDate && currentPeriod === value),
              flex: "1 1 auto",
              textAlign: "center"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 📅 Date Picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: "180px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#9a3412" }}>📅</span>
        <input
          id="date-filter"
          type="date"
          value={currentDate}
          onChange={(e) => update("date", e.target.value)}
          className="input"
          style={{ width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "12px" }}
        />
        {currentDate && (
          <button
            onClick={() => update("date", "")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#9a3412",
              padding: "0 4px",
              lineHeight: 1,
            }}
            title="Clear date"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
