"use client";

import { useState, useEffect } from "react";
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
  worstRated: {
    item: string;
    avg: number;
    count: number;
    recentReviews?: { id: string; rating: number; comment: string; createdAt: string }[];
  }[];
  dailyIndividual: {
    id: string;
    item: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
  }[];
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
  const [isEnlarged, setIsEnlarged] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsEnlarged(false);
      }
    }
    if (isEnlarged) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isEnlarged]);

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "20px" }}>🏆</span>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#78350f", margin: 0 }}>
                  Top 3 Rated Items of this Month
                </h3>
              </div>
            </div>
            {topRated.length > 0 && (
              <button
                type="button"
                onClick={() => setIsEnlarged(true)}
                title="Enlarge for Canteen Display"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 10,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#92400e",
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1.5px solid #fde68a",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(245, 158, 11, 0.1)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>⛶</span>
                <span>Enlarge</span>
              </button>
            )}
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
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(254, 202, 202, 0.85)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

                  {/* Latest Student Remarks for this worst rated item */}
                  {item.recentReviews && item.recentReviews.length > 0 ? (
                    <div
                      style={{
                        marginTop: 2,
                        paddingTop: 8,
                        borderTop: "1px dashed rgba(254, 202, 202, 0.9)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#991b1b",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>💬</span> Latest Student Remarks:
                      </div>
                      {item.recentReviews.map((rev) => (
                        <div
                          key={rev.id}
                          style={{
                            background: "rgba(254, 242, 242, 0.85)",
                            borderLeft: "3px solid #ef4444",
                            padding: "6px 10px",
                            borderRadius: "0 8px 8px 0",
                            fontSize: "12px",
                            color: "#450a0a",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 6,
                          }}
                        >
                          <span style={{ fontStyle: "italic", flex: 1, wordBreak: "break-word" }}>
                            &ldquo;{rev.comment}&rdquo;
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: rev.rating <= 2 ? "#b91c1c" : "#b45309",
                              flexShrink: 0,
                            }}
                          >
                            ⭐ {rev.rating}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: "11px",
                        color: "#991b1b",
                        opacity: 0.65,
                        fontStyle: "italic",
                      }}
                    >
                      No written remarks submitted yet.
                    </div>
                  )}
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
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
                      flexDirection: "column",
                      gap: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
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
                          background:
                            r.rating >= 4
                              ? "rgba(34,197,94,0.12)"
                              : r.rating === 3
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(239,68,68,0.12)",
                          color:
                            r.rating >= 4
                              ? "#15803d"
                              : r.rating === 3
                              ? "#b45309"
                              : "#b91c1c",
                          fontWeight: 800,
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {"⭐".repeat(r.rating)} {r.rating}/5
                      </div>
                    </div>

                    {/* Student Remark under that particular rated item */}
                    {r.comment && (
                      <div
                        style={{
                          padding: "7px 10px",
                          background: "rgba(255, 247, 237, 0.95)",
                          border: "1px dashed #fed7aa",
                          borderRadius: 8,
                          fontSize: "12px",
                          color: "#78350f",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: "12px", flexShrink: 0 }}>💬</span>
                        <span style={{ fontStyle: "italic", flex: 1 }}>&ldquo;{r.comment}&rdquo;</span>
                      </div>
                    )}
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

      {/* ── Fullscreen Display Modal (Clean & Minimal 3-Column Layout) ── */}
      {isEnlarged && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "linear-gradient(135deg, #fffaf5 0%, #fff7ed 50%, #fef3c7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "36px 40px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {/* Keyframes for Nexalaya-style moving shine sweep */}
          <style>{`
            @keyframes nexalaya-shine-display {
              0%   { transform: translateX(-150%); }
              100% { transform: translateX(300%); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: 1100,
              width: "100%",
              margin: "0 auto",
              paddingBottom: 8,
            }}
          >
            {/* Nexalaya-style Moving Shine Heading */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 26px",
                borderRadius: "50px",
                border: "1.5px solid rgba(249,115,22,0.3)",
                background: "rgba(255, 255, 255, 0.88)",
                boxShadow: "0 4px 18px rgba(249,115,22,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "45%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)",
                  animation: "nexalaya-shine-display 2.6s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: "-0.5px",
                  whiteSpace: "nowrap",
                  color: "#431407",
                }}
              >
                Top 3 Rated Items of this Month
              </h1>
            </div>

            {/* Cross Button Only at top right */}
            <button
              type="button"
              onClick={() => setIsEnlarged(false)}
              title="Close"
              aria-label="Close"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                fontSize: "18px",
                fontWeight: 800,
                border: "1.5px solid #fed7aa",
                background: "rgba(255, 255, 255, 0.95)",
                color: "#9a3412",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 12px rgba(249, 115, 22, 0.15)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Triangle Layout: Center on top, 2nd bottom-left, 3rd bottom-right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              maxWidth: 820,
              width: "100%",
              margin: "auto",
              padding: "16px 0",
            }}
          >
            {/* Top Center: Rank 1 */}
            {topRated[0] && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 340,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.94)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 24,
                    border: "1.5px solid #fde68a",
                    boxShadow: "0 10px 30px rgba(245, 158, 11, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
                    padding: "26px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 16,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Item Name with Nexalaya Moving Shine */}
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 22px",
                      borderRadius: "30px",
                      border: "1px solid rgba(249,115,22,0.25)",
                      background: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 2px 10px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "45%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
                        animation: "nexalaya-shine-display 2.6s ease-in-out infinite",
                        pointerEvents: "none",
                      }}
                    />
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 800,
                        color: "#431407",
                        margin: 0,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {topRated[0].item}
                    </h2>
                  </div>

                  <div
                    style={{
                      width: 105,
                      height: 105,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                      border: "2px solid #fde68a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 18px rgba(245, 158, 11, 0.16)",
                    }}
                  >
                    <FoodIcon name={topRated[0].item} size="68px" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 16px",
                        background: "rgba(245, 158, 11, 0.14)",
                        color: "#b45309",
                        borderRadius: 24,
                        fontWeight: 800,
                        fontSize: "18px",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                      }}
                    >
                      <span>⭐</span>
                      <span>{topRated[0].avg.toFixed(1)}</span>
                      <span style={{ fontSize: "13px", opacity: 0.7, fontWeight: 600 }}>/ 5</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#9a3412", opacity: 0.85, fontWeight: 600 }}>
                      {topRated[0].count} rating{topRated[0].count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Row: Rank 2 (Left) and Rank 3 (Right) */}
            {(topRated[1] || topRated[2]) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 32,
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                {topRated[1] && (
                  <div style={{ flex: "1 1 300px", maxWidth: 340 }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.94)",
                        backdropFilter: "blur(20px)",
                        borderRadius: 24,
                        border: "1.5px solid #fde68a",
                        boxShadow: "0 10px 30px rgba(245, 158, 11, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
                        padding: "26px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: 16,
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Item Name with Nexalaya Moving Shine */}
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 22px",
                          borderRadius: "30px",
                          border: "1px solid rgba(249,115,22,0.25)",
                          background: "rgba(255, 255, 255, 0.9)",
                          boxShadow: "0 2px 10px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "45%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
                            animation: "nexalaya-shine-display 2.6s ease-in-out infinite",
                            pointerEvents: "none",
                          }}
                        />
                        <h2
                          style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#431407",
                            margin: 0,
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {topRated[1].item}
                        </h2>
                      </div>

                      <div
                        style={{
                          width: 105,
                          height: 105,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                          border: "2px solid #fde68a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 6px 18px rgba(245, 158, 11, 0.16)",
                        }}
                      >
                        <FoodIcon name={topRated[1].item} size="68px" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 16px",
                            background: "rgba(245, 158, 11, 0.14)",
                            color: "#b45309",
                            borderRadius: 24,
                            fontWeight: 800,
                            fontSize: "18px",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                          }}
                        >
                          <span>⭐</span>
                          <span>{topRated[1].avg.toFixed(1)}</span>
                          <span style={{ fontSize: "13px", opacity: 0.7, fontWeight: 600 }}>/ 5</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "#9a3412", opacity: 0.85, fontWeight: 600 }}>
                          {topRated[1].count} rating{topRated[1].count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {topRated[2] && (
                  <div style={{ flex: "1 1 300px", maxWidth: 340 }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.94)",
                        backdropFilter: "blur(20px)",
                        borderRadius: 24,
                        border: "1.5px solid #fde68a",
                        boxShadow: "0 10px 30px rgba(245, 158, 11, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
                        padding: "26px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: 16,
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Item Name with Nexalaya Moving Shine */}
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 22px",
                          borderRadius: "30px",
                          border: "1px solid rgba(249,115,22,0.25)",
                          background: "rgba(255, 255, 255, 0.9)",
                          boxShadow: "0 2px 10px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "45%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
                            animation: "nexalaya-shine-display 2.6s ease-in-out infinite",
                            pointerEvents: "none",
                          }}
                        />
                        <h2
                          style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#431407",
                            margin: 0,
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {topRated[2].item}
                        </h2>
                      </div>

                      <div
                        style={{
                          width: 105,
                          height: 105,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                          border: "2px solid #fde68a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 6px 18px rgba(245, 158, 11, 0.16)",
                        }}
                      >
                        <FoodIcon name={topRated[2].item} size="68px" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 16px",
                            background: "rgba(245, 158, 11, 0.14)",
                            color: "#b45309",
                            borderRadius: 24,
                            fontWeight: 800,
                            fontSize: "18px",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                          }}
                        >
                          <span>⭐</span>
                          <span>{topRated[2].avg.toFixed(1)}</span>
                          <span style={{ fontSize: "13px", opacity: 0.7, fontWeight: 600 }}>/ 5</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "#9a3412", opacity: 0.85, fontWeight: 600 }}>
                          {topRated[2].count} rating{topRated[2].count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          
        </div>
      )}
    </div>
  );
}
