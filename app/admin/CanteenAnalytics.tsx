"use client";

import { useState } from "react";
import FoodIcon from "@/app/components/FoodIcon";

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export interface CanteenAnalyticsProps {
  topRated: { item: string; avg: number; count: number }[];
  worstRated: { item: string; avg: number; count: number }[];
  dailyIndividual: { id: string; item: string; rating: number; createdAt: string }[];
  dailyAverages: { item: string; avg: number; count: number }[];
  dateLabel: string;
}

export default function CanteenAnalytics({
  topRated,
  worstRated,
  dailyIndividual,
  dailyAverages,
  dateLabel,
}: CanteenAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"individual" | "average">("individual");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        marginBottom: 8,
      }}
    >
      {/* ── Top Highlights Grid (Top 3 & Worst of Month) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {/* 🏆 Top 3 Rated Items */}
        <div
          className="glass"
          style={{
            padding: "20px 22px",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(254, 243, 199, 0.5))",
            border: "1.5px solid #fde68a",
            boxShadow: "0 6px 20px rgba(245, 158, 11, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: "20px" }}>🏆</span>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#78350f", margin: 0 }}>
                Top 3 Rated Items of this Month
              </h3>
            </div>
          </div>

          {topRated.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#92400e", opacity: 0.8, padding: "12px 0" }}>
              No item ratings recorded this month yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topRated.map((item, idx) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={item.item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "rgba(255, 255, 255, 0.85)",
                      border: "1px solid rgba(253, 230, 138, 0.8)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "18px" }}>{medals[idx] || "⭐"}</span>
                      <FoodIcon name={item.item} size="30px" />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#451a03" }}>
                          {item.item}
                        </div>
                        <div style={{ fontSize: "11px", color: "#92400e" }}>
                          {item.count} rating{item.count > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        background: "rgba(245, 158, 11, 0.12)",
                        color: "#b45309",
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: "13px",
                      }}
                    >
                      <span>⭐</span>
                      <span>{item.avg.toFixed(1)}</span>
                      <span style={{ fontSize: "11px", opacity: 0.7 }}>/ 5</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ⚠️ Worst Rated Items */}
        <div
          className="glass"
          style={{
            padding: "20px 22px",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(254, 226, 226, 0.5))",
            border: "1.5px solid #fecaca",
            boxShadow: "0 6px 20px rgba(239, 68, 68, 0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#7f1d1d", margin: 0 }}>
                Lowest Rated Items of this Month
              </h3>
              <span style={{ fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>
                Needs Quality Improvement
              </span>
            </div>
          </div>

          {worstRated.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#991b1b", opacity: 0.8, padding: "12px 0" }}>
              No low-rated items recorded this month.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {worstRated.map((item) => (
                <div
                  key={item.item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(254, 202, 202, 0.8)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "18px" }}>🔻</span>
                    <FoodIcon name={item.item} size="30px" />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#450a0a" }}>
                        {item.item}
                      </div>
                      <div style={{ fontSize: "11px", color: "#991b1b" }}>
                        {item.count} rating{item.count > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#b91c1c",
                      borderRadius: 20,
                      fontWeight: 800,
                      fontSize: "13px",
                    }}
                  >
                    <span>⭐</span>
                    <span>{item.avg.toFixed(1)}</span>
                    <span style={{ fontSize: "11px", opacity: 0.7 }}>/ 5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Daily Ratings (Individual vs Average Toggle) ── */}
      <div
        className="glass"
        style={{
          padding: "22px 24px",
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.9)",
          border: "1.5px solid #fed7aa",
          boxShadow: "0 6px 24px rgba(120, 53, 15, 0.05)",
        }}
      >
        {/* Header & Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18,
            paddingBottom: 14,
            borderBottom: "1px solid rgba(254, 215, 170, 0.6)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#431407", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span>📅</span> Daily Ratings
            </h3>
            <span style={{ fontSize: "12px", color: "#9a3412", fontWeight: 600 }}>
              {dateLabel}
            </span>
          </div>

          {/* Toggle Pills */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 247, 237, 0.9)",
              padding: "4px",
              borderRadius: 14,
              border: "1px solid #fed7aa",
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("individual")}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === "individual" ? "linear-gradient(135deg, #f97316, #ef4444)" : "transparent",
                color: activeTab === "individual" ? "#ffffff" : "#78350f",
                boxShadow: activeTab === "individual" ? "0 2px 8px rgba(249, 115, 22, 0.3)" : "none",
              }}
            >
              📝 Individual ({dailyIndividual.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("average")}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === "average" ? "linear-gradient(135deg, #f97316, #ef4444)" : "transparent",
                color: activeTab === "average" ? "#ffffff" : "#78350f",
                boxShadow: activeTab === "average" ? "0 2px 8px rgba(249, 115, 22, 0.3)" : "none",
              }}
            >
              📊 Daily Average ({dailyAverages.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Individual Ratings */}
        {activeTab === "individual" && (
          <div>
            {dailyIndividual.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 16px",
                  color: "#9a3412",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                No individual ratings submitted for this day yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {dailyIndividual.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "#fffaf5",
                      border: "1.5px solid #fed7aa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FoodIcon name={r.item} size="28px" />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#431407" }}>
                          {r.item}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9a3412", opacity: 0.8, marginTop: 2 }}>
                          🕒 {formatTime(r.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: 10,
                        background: r.rating >= 4 ? "rgba(34,197,94,0.12)" : r.rating === 3 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                        color: r.rating >= 4 ? "#15803d" : r.rating === 3 ? "#b45309" : "#b91c1c",
                        fontWeight: 800,
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {"⭐".repeat(r.rating)} {r.rating}/5
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Daily Average */}
        {activeTab === "average" && (
          <div>
            {dailyAverages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 16px",
                  color: "#9a3412",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                No ratings submitted for this day yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dailyAverages.map((item) => (
                  <div
                    key={item.item}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 14,
                      background: "#fffaf5",
                      border: "1.5px solid #fed7aa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FoodIcon name={item.item} size="32px" />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#431407" }}>
                          {item.item}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9a3412", opacity: 0.8 }}>
                          Based on {item.count} rating{item.count > 1 ? "s" : ""} today
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 12px",
                        background: "rgba(249, 115, 22, 0.1)",
                        color: "#c2410c",
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: "14px",
                      }}
                    >
                      <span>⭐</span>
                      <span>{item.avg.toFixed(1)}</span>
                      <span style={{ fontSize: "11px", opacity: 0.7 }}>/ 5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
