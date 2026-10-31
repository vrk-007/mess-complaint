"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FoodIcon from "@/app/components/FoodIcon";

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
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
  allRatings: {
    id: string;
    item: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    quantityRating?: number | null;
    hygieneRating?: number | null;
    staffRating?: number | null;
    cleanlinessRating?: number | null;
  }[];
}

type Period = "all" | "1w" | "2w" | "1m" | "date";
type Dimension = "staff" | "cleanliness" | null;

const PERIOD_LABELS: { value: Period; label: string }[] = [
  { value: "all", label: "All" },
  { value: "1w",  label: "1 Wk" },
  { value: "2w",  label: "2 Wks" },
  { value: "1m",  label: "1 Month" },
  { value: "date", label: "📅 By Date" },
];

function getFilteredRatings(
  ratings: CanteenAnalyticsProps["allRatings"],
  period: Period,
  customDate: string
) {
  const now = new Date();
  if (period === "1w") {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return ratings.filter((r) => new Date(r.createdAt) >= from);
  }
  if (period === "2w") {
    const from = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return ratings.filter((r) => new Date(r.createdAt) >= from);
  }
  if (period === "1m") {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return ratings.filter((r) => new Date(r.createdAt) >= from);
  }
  if (period === "date" && customDate) {
    const start = new Date(customDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(customDate); end.setHours(23, 59, 59, 999);
    return ratings.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= start && d <= end;
    });
  }
  return ratings; // "all"
}

/* ── Circular Score Component (e.g. 50/100, 76/100) ── */
function CircularScore({
  score,
  total = 100,
  label,
  count,
}: {
  score: number;
  total?: number;
  label: string;
  count: number;
}) {
  const radius = 48;
  const stroke = 9;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), total) / total) * circumference;

  const ringColor =
    score >= 70 ? "#16a34a" : score >= 50 ? "#ea580c" : "#dc2626";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 20px",
        background: "linear-gradient(135deg, rgba(255, 247, 237, 0.9), rgba(255, 237, 213, 0.6))",
        border: "1.5px solid #fed7aa",
        borderRadius: "18px",
        gap: 8,
        boxShadow: "0 4px 16px rgba(249, 115, 22, 0.08)",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      <div style={{ position: "relative", width: 116, height: 116 }}>
        <svg height="116" width="116" style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle */}
          <circle
            stroke="rgba(254, 215, 170, 0.5)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="58"
            cy="58"
          />
          {/* Progress circle */}
          <circle
            stroke={ringColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="58"
            cy="58"
          />
        </svg>

        {/* Text inside circle */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.1,
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#431407" }}>
            {score}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#9a3412", opacity: 0.85 }}>
            / {total}
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "#431407" }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: "#9a3412", fontWeight: 600, marginTop: 2 }}>
          Based on {count} rating{count !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

/* ── Item Detail Modal (Shows only 3 parameters: Overall, Quantity if rated, Hygiene if rated) ── */
function ItemDetailModal({
  rating,
  onClose,
}: {
  rating: CanteenAnalyticsProps["allRatings"][0];
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fffaf5 100%)",
          border: "1.5px solid #fed7aa",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 12px 36px rgba(120, 53, 15, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          position: "relative",
          animation: "modal-pop 0.2s ease-out",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1px solid #fed7aa",
            background: "#fff",
            color: "#9a3412",
            fontSize: "16px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 32 }}>
          <FoodIcon name={rating.item} size="36px" />
          <div>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#431407" }}>
              {rating.item}
            </h4>
            <span style={{ fontSize: "11px", color: "#9a3412", opacity: 0.8 }}>
              {formatTime(rating.createdAt)}
            </span>
          </div>
        </div>

        {/* Parameters Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "rgba(255, 247, 237, 0.75)",
            border: "1px solid #fed7aa",
            borderRadius: "14px",
            padding: "14px 16px",
          }}
        >
          {/* 1. ⭐ Overall (Always shown) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#431407" }}>
              ⭐ Overall
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: rating.rating >= 4 ? "#15803d" : rating.rating === 3 ? "#b45309" : "#b91c1c",
                background: "#ffffff",
                padding: "3px 10px",
                borderRadius: "10px",
                border: "1px solid #fed7aa",
              }}
            >
              {"⭐".repeat(rating.rating)} {rating.rating}/5
            </span>
          </div>

          {/* 2. ⭐ Quantity (Shown only if rated) */}
          {rating.quantityRating != null && rating.quantityRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#431407" }}>
                🍽️ Quantity
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: rating.quantityRating >= 4 ? "#15803d" : rating.quantityRating === 3 ? "#b45309" : "#b91c1c",
                  background: "#ffffff",
                  padding: "3px 10px",
                  borderRadius: "10px",
                  border: "1px solid #fed7aa",
                }}
              >
                {"⭐".repeat(rating.quantityRating)} {rating.quantityRating}/5
              </span>
            </div>
          )}

          {/* 3. ⭐ Hygiene (Shown only if rated) */}
          {rating.hygieneRating != null && rating.hygieneRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#431407" }}>
                🧼 Hygiene
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: rating.hygieneRating >= 4 ? "#15803d" : rating.hygieneRating === 3 ? "#b45309" : "#b91c1c",
                  background: "#ffffff",
                  padding: "3px 10px",
                  borderRadius: "10px",
                  border: "1px solid #fed7aa",
                }}
              >
                {"⭐".repeat(rating.hygieneRating)} {rating.hygieneRating}/5
              </span>
            </div>
          )}

          {/* Notice if no optional parameters were given */}
          {rating.quantityRating == null && rating.hygieneRating == null && (
            <div style={{ fontSize: "11px", color: "#9a3412", opacity: 0.7, fontStyle: "italic", textAlign: "center" }}>
              (Optional quantity & hygiene ratings were not provided for this submission)
            </div>
          )}
        </div>

        {/* Remark */}
        {rating.comment && (
          <div
            style={{
              padding: "10px 14px",
              background: "#ffffff",
              border: "1px dashed #fed7aa",
              borderRadius: "10px",
              fontSize: "12.5px",
              color: "#78350f",
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#9a3412", marginBottom: 3 }}>
              Student Remark:
            </div>
            &ldquo;{rating.comment}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

export default function CanteenAnalytics({
  topRated: initialTopRated = [],
  worstRated: initialWorstRated = [],
  allRatings,
}: CanteenAnalyticsProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("all");
  const [customDate, setCustomDate] = useState("");
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Auto-refresh listener for real-time rating updates ──
  useEffect(() => {
    // 1. BroadcastChannel for instant cross-tab sync in the same browser
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("canteen_updates");
      bc.onmessage = (e) => {
        if (e.data?.type === "NEW_RATING") {
          router.refresh();
        }
      };
    } catch {}

    // 2. Storage event for cross-tab sync fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "canteen_last_updated") {
        router.refresh();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Tab focus (re-fetch when user returns to this tab)
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", handleFocus);

    // 4. Polling every 10 seconds for open kiosk / admin dashboards
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [router]);

  // ── Dynamically compute Top 3 & Lowest Rated directly from allRatings ──
  // This guarantees that whenever any rating is submitted (student, prof, admin, anywhere),
  // Top 3 and Lowest Rated update IMMEDIATELY in real-time!
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthRatings = allRatings.filter((r) => new Date(r.createdAt) >= monthStart);
  // Use current month ratings if there are any; otherwise fallback to allRatings
  const ratingsForHighlights = currentMonthRatings.length > 0 ? currentMonthRatings : allRatings;

  const itemMap: Record<
    string,
    {
      total: number;
      count: number;
      recentReviews: { id: string; rating: number; comment: string; createdAt: string }[];
    }
  > = {};

  for (const r of ratingsForHighlights) {
    if (!itemMap[r.item]) {
      itemMap[r.item] = { total: 0, count: 0, recentReviews: [] };
    }
    itemMap[r.item].total += r.rating;
    itemMap[r.item].count += 1;
    if (r.comment && r.comment.trim().length > 0 && itemMap[r.item].recentReviews.length === 0) {
      itemMap[r.item].recentReviews.push({
        id: r.id,
        rating: r.rating,
        comment: r.comment.trim(),
        createdAt: r.createdAt,
      });
    }
  }

  // Fallback: If any item in itemMap has no comment in current month, pull its latest comment from allRatings
  for (const [item, stat] of Object.entries(itemMap)) {
    if (stat.recentReviews.length === 0) {
      const older = allRatings.find((ar) => ar.item === item && ar.comment && ar.comment.trim().length > 0);
      if (older && older.comment) {
        stat.recentReviews.push({
          id: older.id,
          rating: older.rating,
          comment: older.comment.trim(),
          createdAt: older.createdAt,
        });
      }
    }
  }

  const itemsArray = Object.entries(itemMap).map(([item, stat]) => ({
    item,
    avg: Number((stat.total / stat.count).toFixed(1)),
    count: stat.count,
    recentReviews: stat.recentReviews,
  }));

  const dynamicTopRated = itemsArray
    .filter((item) => item.avg >= 3.0)
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, 3);

  const dynamicWorstRated = itemsArray
    .filter((item) => item.avg < 3.0)
    .sort((a, b) => a.avg - b.avg || b.count - a.count)
    .slice(0, 3);

  const topRated = allRatings.length > 0 ? dynamicTopRated : initialTopRated;
  const worstRated = allRatings.length > 0 ? dynamicWorstRated : initialWorstRated;

  // New Dimension Filter state ("staff" | "cleanliness" | null)
  const [activeDimension, setActiveDimension] = useState<Dimension>(null);

  // Selected rating for detailed modal
  const [selectedRating, setSelectedRating] = useState<CanteenAnalyticsProps["allRatings"][0] | null>(null);

  const ITEMS_PER_PAGE = 5;

  // When a dimension is active, we filter by that dimension from all ratings
  const isDimensionActive = activeDimension !== null;

  const filteredRatings = isDimensionActive
    ? allRatings.filter((r) =>
        activeDimension === "staff"
          ? r.staffRating != null && r.staffRating > 0
          : r.cleanlinessRating != null && r.cleanlinessRating > 0
      )
    : getFilteredRatings(allRatings, period, customDate);

  // Calculate circular score (out of 100) for the active dimension
  const dimensionRatings = isDimensionActive
    ? allRatings.filter((r) =>
        activeDimension === "staff"
          ? r.staffRating != null && r.staffRating > 0
          : r.cleanlinessRating != null && r.cleanlinessRating > 0
      )
    : [];

  const dimensionCount = dimensionRatings.length;
  const dimensionSum = dimensionRatings.reduce(
    (sum, r) =>
      sum + (activeDimension === "staff" ? r.staffRating || 0 : r.cleanlinessRating || 0),
    0
  );
  const dimensionAvgStars = dimensionCount > 0 ? dimensionSum / dimensionCount : 0;
  // Convert 1-5 stars to 0-100 score: (avg / 5) * 100 = avg * 20
  const dimensionScore = Math.round(dimensionAvgStars * 20);

  // Reset page when period, customDate, or activeDimension changes
  useEffect(() => {
    setCurrentPage(1);
  }, [period, customDate, activeDimension]);

  const totalPages = Math.ceil(filteredRatings.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedRatings = filteredRatings.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsEnlarged(false);
        setSelectedRating(null);
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

      {/* ── Hint: Filter Ratings ── */}
      <p
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#78350f",
          textAlign: "center",
          width: "100%",
          margin: "4px 0",
        }}
      >
        From below 👇🏻 filter, you can see all Ratings
      </p>

      {/* ── Ratings Section with Period & Dimension Filter ── */}
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "1px solid rgba(254, 215, 170, 0.6)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#431407", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⭐</span>{" "}
              {activeDimension === "staff"
                ? "Staff Behaviour Ratings"
                : activeDimension === "cleanliness"
                ? "Canteen Cleanliness Ratings"
                : "Ratings"}
            </h3>
            <span style={{ fontSize: "12px", color: "#9a3412", fontWeight: 600 }}>
              {isDimensionActive
                ? `${filteredRatings.length} rating${filteredRatings.length !== 1 ? "s" : ""} recorded for this aspect`
                : `${filteredRatings.length} rating${filteredRatings.length !== 1 ? "s" : ""} shown`}
            </span>
          </div>

          {/* Filter Bar: Dimension Pills on Left + Period Pills on Right */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {/* 1. ⭐ Staff Behaviour (left of "All") */}
            <button
              type="button"
              onClick={() => {
                setActiveDimension((prev) => (prev === "staff" ? null : "staff"));
              }}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                fontSize: "12px",
                fontWeight: 700,
                border: "1.5px solid",
                borderColor: activeDimension === "staff" ? "#f97316" : "#fed7aa",
                cursor: "pointer",
                background:
                  activeDimension === "staff"
                    ? "linear-gradient(135deg,#f97316,#ef4444)"
                    : "rgba(255,255,255,0.85)",
                color: activeDimension === "staff" ? "#fff" : "#78350f",
                boxShadow: activeDimension === "staff" ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              ⭐ Staff Behaviour
            </button>

            {/* 2. ⭐ Cleanliness (left of "All") */}
            <button
              type="button"
              onClick={() => {
                setActiveDimension((prev) => (prev === "cleanliness" ? null : "cleanliness"));
              }}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                fontSize: "12px",
                fontWeight: 700,
                border: "1.5px solid",
                borderColor: activeDimension === "cleanliness" ? "#f97316" : "#fed7aa",
                cursor: "pointer",
                background:
                  activeDimension === "cleanliness"
                    ? "linear-gradient(135deg,#f97316,#ef4444)"
                    : "rgba(255,255,255,0.85)",
                color: activeDimension === "cleanliness" ? "#fff" : "#78350f",
                boxShadow: activeDimension === "cleanliness" ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              ⭐ Cleanliness
            </button>

            {/* Visual Divider between Dimension Options and Period Options */}
            <div style={{ width: 1, height: 22, background: "#fed7aa", margin: "0 2px" }} />

            {/* Period Pills + Date Picker */}
            {PERIOD_LABELS.map(({ value, label }) => {
              const isPeriodActive =
                !isDimensionActive &&
                period === value &&
                (value !== "date" || !customDate || period === "date");

              return value === "date" ? (
                <div key="date" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDimension(null);
                      setPeriod("date");
                    }}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 10,
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1.5px solid",
                      borderColor: isPeriodActive ? "#f97316" : "#fed7aa",
                      cursor: "pointer",
                      background: isPeriodActive
                        ? "linear-gradient(135deg,#f97316,#ef4444)"
                        : "rgba(255,255,255,0.8)",
                      color: isPeriodActive ? "#fff" : "#78350f",
                      boxShadow: isPeriodActive ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </button>
                  {isPeriodActive && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 10,
                        border: "1.5px solid #f97316",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#431407",
                        background: "rgba(255,255,255,0.9)",
                        outline: "none",
                        cursor: "pointer",
                        boxShadow: "0 0 0 3px rgba(249,115,22,0.12)",
                      }}
                    />
                  )}
                </div>
              ) : (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setActiveDimension(null);
                    setPeriod(value);
                    setCustomDate("");
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 10,
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "1.5px solid",
                    borderColor: isPeriodActive ? "#f97316" : "#fed7aa",
                    cursor: "pointer",
                    background: isPeriodActive
                      ? "linear-gradient(135deg,#f97316,#ef4444)"
                      : "rgba(255,255,255,0.8)",
                    color: isPeriodActive ? "#fff" : "#78350f",
                    boxShadow: isPeriodActive ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Circular Score View for Dimension Filters (Staff / Cleanliness) ── */}
        {isDimensionActive && (
          <div style={{ marginBottom: 20 }}>
            <CircularScore
              score={dimensionScore}
              total={100}
              label={
                activeDimension === "staff"
                  ? "Staff Behaviour Average Score"
                  : "Canteen Cleanliness Average Score"
              }
              count={dimensionCount}
            />
          </div>
        )}

        {/* Ratings List */}
        {filteredRatings.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "36px 16px",
              color: "#9a3412",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {isDimensionActive
              ? `No ${activeDimension === "staff" ? "Staff Behaviour" : "Cleanliness"} ratings recorded yet.`
              : "No ratings found for the selected period."}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {paginatedRatings.map((r) => {
              // Rating badge value to show
              const ratingDisplay = isDimensionActive
                ? activeDimension === "staff"
                  ? r.staffRating
                  : r.cleanlinessRating
                : r.rating;

              const badgeRating = ratingDisplay || 0;

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    // Open item modal only in regular item view
                    if (!isDimensionActive) {
                      setSelectedRating(r);
                    }
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#fffaf5",
                    border: "1.5px solid #fed7aa",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                    cursor: isDimensionActive ? "default" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDimensionActive) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(249,115,22,0.12)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDimensionActive) {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.02)";
                    }
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
                      {isDimensionActive ? (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: activeDimension === "staff" ? "rgba(249,115,22,0.15)" : "rgba(34,197,94,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                          }}
                        >
                          {activeDimension === "staff" ? "🤝" : "✨"}
                        </div>
                      ) : (
                        <FoodIcon name={r.item} size="28px" />
                      )}
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#431407" }}>
                          {isDimensionActive
                            ? activeDimension === "staff"
                              ? "Staff Behaviour"
                              : "Cleanliness"
                            : r.item}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9a3412", opacity: 0.8, marginTop: 2 }}>
                          {formatTime(r.createdAt)}
                          {isDimensionActive && r.item ? ` • For ${r.item}` : ""}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: 10,
                        background:
                          badgeRating >= 4
                            ? "rgba(34,197,94,0.12)"
                            : badgeRating === 3
                            ? "rgba(245,158,11,0.12)"
                            : "rgba(239,68,68,0.12)",
                        color:
                          badgeRating >= 4
                            ? "#15803d"
                            : badgeRating === 3
                            ? "#b45309"
                            : "#b91c1c",
                        fontWeight: 800,
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isDimensionActive ? (activeDimension === "staff" ? "🤝 Staff: " : "✨ Cleanliness: ") : ""}
                      {"⭐".repeat(badgeRating)} {badgeRating}/5
                    </div>
                  </div>

                  {/* Comment */}
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
                      <span style={{ fontStyle: "italic", flex: 1 }}>&ldquo;{r.comment}&rdquo;</span>
                    </div>
                  )}

                  {/* Badges for optional parameters present */}
                  {!isDimensionActive && (r.quantityRating != null || r.hygieneRating != null) && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                      {r.quantityRating != null && r.quantityRating > 0 && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#9a3412",
                            background: "rgba(249,115,22,0.08)",
                            padding: "2px 7px",
                            borderRadius: 6,
                            border: "1px solid rgba(249,115,22,0.15)",
                          }}
                        >
                          🍽️ Qty: {r.quantityRating}/5
                        </span>
                      )}
                      {r.hygieneRating != null && r.hygieneRating > 0 && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#9a3412",
                            background: "rgba(249,115,22,0.08)",
                            padding: "2px 7px",
                            borderRadius: 6,
                            border: "1px solid rgba(249,115,22,0.15)",
                          }}
                        >
                          🧼 Hygiene: {r.hygieneRating}/5
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Ratings Pagination Bar ── */}
        {filteredRatings.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid rgba(254, 215, 170, 0.6)",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#9a3412", fontWeight: 600 }}>
              Showing{" "}
              <strong>
                {((safeCurrentPage - 1) * ITEMS_PER_PAGE) + 1}–
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredRatings.length)}
              </strong>{" "}
              of <strong>{filteredRatings.length}</strong> rating{filteredRatings.length !== 1 ? "s" : ""}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage <= 1}
                title="Previous page"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: safeCurrentPage <= 1 ? "rgba(254, 215, 170, 0.5)" : "#fed7aa",
                  background: safeCurrentPage <= 1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)",
                  color: safeCurrentPage <= 1 ? "#fdba74" : "#78350f",
                  cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  fontWeight: 800,
                  transition: "all 0.2s ease",
                  boxShadow: safeCurrentPage <= 1 ? "none" : "0 2px 6px rgba(249,115,22,0.12)",
                }}
              >
                ←
              </button>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#431407",
                  padding: "0 6px",
                  minWidth: "75px",
                  textAlign: "center",
                }}
              >
                Page {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage >= totalPages}
                title="Next page"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: safeCurrentPage >= totalPages ? "rgba(254, 215, 170, 0.5)" : "#fed7aa",
                  background: safeCurrentPage >= totalPages ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)",
                  color: safeCurrentPage >= totalPages ? "#fdba74" : "#78350f",
                  cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  fontWeight: 800,
                  transition: "all 0.2s ease",
                  boxShadow: safeCurrentPage >= totalPages ? "none" : "0 2px 6px rgba(249,115,22,0.12)",
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Item Detail Modal (3 parameters: Overall, Quantity if rated, Hygiene if rated) ── */}
      {selectedRating && (
        <ItemDetailModal
          rating={selectedRating}
          onClose={() => setSelectedRating(null)}
        />
      )}

      {/* ── Fullscreen Display Modal (70% Left + 30% Right layout) ── */}
      {isEnlarged && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "linear-gradient(135deg, #fffaf5 0%, #fff7ed 50%, #fef3c7 100%)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Keyframes */}
          <style>{`
            @keyframes nexalaya-shine-display {
              0%   { transform: translateX(-150%); }
              100% { transform: translateX(300%); }
            }
            @keyframes review-marquee {
              0%   { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            @keyframes arrow-bounce {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(8px); }
            }
            @keyframes glow-pulse {
              0%, 100% { box-shadow: 0 0 18px rgba(249,115,22,0.2), 0 0 36px rgba(249,115,22,0.08); }
              50%       { box-shadow: 0 0 28px rgba(249,115,22,0.38), 0 0 56px rgba(249,115,22,0.14); }
            }
          `}</style>

          {/* Top Header Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 32px 14px",
              borderBottom: "1px solid rgba(254,215,170,0.4)",
              flexShrink: 0,
            }}
          >
            {/* Heading with moving shine */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 28px",
                borderRadius: "50px",
                border: "1.5px solid rgba(249,115,22,0.3)",
                background: "rgba(255,255,255,0.88)",
                boxShadow: "0 4px 18px rgba(249,115,22,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: "45%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)",
                  animation: "nexalaya-shine-display 2.6s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: "-0.3px",
                  whiteSpace: "nowrap",
                  color: "#431407",
                }}
              >
                Top 3 Rated Items of this Month
              </h1>
            </div>

            {/* Close button */}
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
                background: "rgba(255,255,255,0.95)",
                color: "#9a3412",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 12px rgba(249,115,22,0.15)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Main Body: 80% Left | 20% Right */}
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {/* ── LEFT 80%: Triangle + Latest Reviews ── */}
            <div
              style={{
                flex: "0 0 80%",
                display: "flex",
                flexDirection: "column",
                padding: "16px 24px 14px 28px",
                gap: 14,
                borderRight: "1px solid rgba(254,215,170,0.5)",
                overflow: "hidden",
              }}
            >
              {/* Triangle Top-3 layout */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  flex: "0 0 auto",
                }}
              >
                {/* Rank 1 — Top center */}
                {topRated[0] && (
                  <div style={{ maxWidth: 280, width: "100%" }}>
                    <DisplayRankCard item={topRated[0]} rank={0} />
                  </div>
                )}

                {/* Rank 2 & 3 — Bottom row */}
                {(topRated[1] || topRated[2]) && (
                  <div style={{ display: "flex", gap: 20, width: "100%", justifyContent: "center" }}>
                    {topRated[1] && (
                      <div style={{ flex: "1 1 0", maxWidth: 260 }}>
                        <DisplayRankCard item={topRated[1]} rank={1} />
                      </div>
                    )}
                    {topRated[2] && (
                      <div style={{ flex: "1 1 0", maxWidth: 260 }}>
                        <DisplayRankCard item={topRated[2]} rank={2} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Latest Reviews Ticker (Only 3 stars and above for current view) */}
              {(() => {
                const highRatings = filteredRatings.filter((r) => {
                  const val = isDimensionActive
                    ? (activeDimension === "staff" ? r.staffRating : r.cleanlinessRating) || 0
                    : r.rating;
                  return val >= 3;
                });
                if (highRatings.length === 0) return null;
                const MIN_VISIBLE = 6;
                const repeatCount = Math.max(1, Math.ceil(MIN_VISIBLE / highRatings.length));
                const tickerBase: typeof highRatings = [];
                for (let i = 0; i < repeatCount; i++) tickerBase.push(...highRatings);
                const tickerItems = [...tickerBase, ...tickerBase];
                const animDuration = Math.max(tickerBase.length * 5, 20);
                return (
                  <div style={{ flex: "0 0 auto" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9a3412",
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: 0.85,
                      }}
                    >
                      Latest Reviews
                    </div>
                    {/* Marquee container */}
                    <div
                      style={{
                        overflow: "hidden",
                        width: "100%",
                        borderRadius: 14,
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                        maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          animation: `review-marquee ${animDuration}s linear infinite`,
                          width: "max-content",
                          willChange: "transform",
                        }}
                      >
                        {tickerItems.map((r, i) => {
                          const tickerRating = isDimensionActive
                            ? (activeDimension === "staff" ? r.staffRating : r.cleanlinessRating) || 0
                            : r.rating;

                          return (
                            <div
                              key={`ticker-${r.id}-${i}`}
                              style={{
                                flexShrink: 0,
                                width: 196,
                                position: "relative",
                                overflow: "hidden",
                                background: "rgba(255,255,255,0.9)",
                                border: "1.5px solid #fed7aa",
                                borderRadius: 14,
                                padding: "10px 14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 5,
                                boxShadow: "0 2px 10px rgba(249,115,22,0.06)",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0, left: 0,
                                  width: "40%",
                                  height: "100%",
                                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                                  animation: "nexalaya-shine-display 3s ease-in-out infinite",
                                  pointerEvents: "none",
                                }}
                              />
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#431407", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                  {isDimensionActive
                                    ? activeDimension === "staff"
                                      ? "🤝 Staff Behaviour"
                                      : "✨ Cleanliness"
                                    : r.item}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: tickerRating >= 4 ? "#15803d" : "#b45309",
                                    background: tickerRating >= 4 ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                                    padding: "2px 7px",
                                    borderRadius: 10,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                  }}
                                >
                                  ⭐ {tickerRating}/5
                                </div>
                              </div>
                              {r.comment && (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#78350f",
                                    fontStyle: "italic",
                                    lineHeight: 1.35,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  &ldquo;{r.comment}&rdquo;
                                </div>
                              )}
                              <div style={{ fontSize: "10px", color: "#9a3412", opacity: 0.65 }}>
                                {formatTime(r.createdAt)}
                                {isDimensionActive && r.item ? ` • ${r.item}` : ""}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Empty state for reviews */}
              {filteredRatings.filter((r) => r.rating >= 3).length === 0 && (
                <div
                  style={{
                    flex: "0 0 auto",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.7)",
                    border: "1px dashed #fed7aa",
                    fontSize: "13px",
                    color: "#9a3412",
                    opacity: 0.75,
                  }}
                >
                  No reviews as of now
                </div>
              )}
            </div>

            {/* ── RIGHT 20%: CTA + QR ── */}
            <div
              style={{
                flex: "0 0 20%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "20px 14px 16px",
                gap: 14,
              }}
            >
              {/* CTA Text with shine */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  textAlign: "center",
                  padding: "22px 16px 20px",
                  borderRadius: 20,
                  border: "1.5px solid rgba(249,115,22,0.25)",
                  background: "rgba(255,255,255,0.88)",
                  boxShadow: "0 4px 18px rgba(249,115,22,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                  width: "100%",
                  boxSizing: "border-box",
                  animation: "glow-pulse 3s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "40%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                    animation: "nexalaya-shine-display 2.8s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ fontSize: "22px", marginBottom: 6 }}>✨</div>
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 900,
                    color: "#431407",
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  Be the special one<br />to give the feedback
                </h2>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9a3412",
                    marginTop: 6,
                    marginBottom: 0,
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  Your voice shapes what&apos;s on the menu!
                </p>
              </div>

              {/* Animated Arrow */}
              <div
                style={{
                  fontSize: "24px",
                  animation: "arrow-bounce 1.4s ease-in-out infinite",
                  color: "#f97316",
                  lineHeight: 1,
                }}
              >
                ↓
              </div>

              {/* QR Code Block */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.95)",
                    border: "2px solid #fde68a",
                    boxShadow: "0 8px 28px rgba(245,158,11,0.14)",
                    padding: 8,
                    boxSizing: "border-box",
                    animation: "glow-pulse 3s ease-in-out infinite",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mess-portal-qr.svg"
                    alt="Scan to rate the canteen"
                    width={120}
                    height={120}
                    style={{ display: "block", borderRadius: 10 }}
                  />
                </div>

                {/* Rate Me label with shine */}
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 28px",
                    borderRadius: "50px",
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                    border: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0, left: 0,
                      width: "45%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                      animation: "nexalaya-shine-display 2.2s ease-in-out infinite",
                      pointerEvents: "none",
                    }}
                  />
                  <span style={{ fontSize: "18px" }}>⭐</span>
                  <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>
                    Rate Me!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable Display Rank Card (compact for 70% panel) ── */
function DisplayRankCard({
  item,
  rank,
}: {
  item: { item: string; avg: number; count: number };
  rank: number;
}) {
  const rankNums = ["1", "2", "3"];
  const sizes = [90, 78, 78];
  const iconSizes = ["56px", "48px", "48px"];
  const fontSizes = ["18px", "16px", "16px"];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        border: "1.5px solid #fde68a",
        boxShadow: "0 8px 24px rgba(245,158,11,0.1), 0 2px 8px rgba(0,0,0,0.04)",
        padding: rank === 0 ? "20px 18px" : "14px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 10,
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shine on card */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "40%",
          height: "100%",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)",
          animation: "nexalaya-shine-display 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Rank number badge + name */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 16px",
          borderRadius: "30px",
          border: "1px solid rgba(249,115,22,0.2)",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 1px 6px rgba(249,115,22,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "45%",
            height: "100%",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
            animation: "nexalaya-shine-display 2.6s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <span style={{ fontSize: fontSizes[rank], fontWeight: 900, color: "#b45309" }}>#{rankNums[rank]}</span>
        <h2
          style={{
            fontSize: fontSizes[rank],
            fontWeight: 800,
            color: "#431407",
            margin: 0,
            letterSpacing: "-0.3px",
            whiteSpace: "nowrap",
          }}
        >
          {item.item}
        </h2>
      </div>

      {/* Food icon circle */}
      <div
        style={{
          width: sizes[rank],
          height: sizes[rank],
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          border: "2px solid #fde68a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(245,158,11,0.14)",
        }}
      >
        <FoodIcon name={item.item} size={iconSizes[rank]} />
      </div>

      {/* Rating */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 12px",
            background: "rgba(245,158,11,0.12)",
            color: "#b45309",
            borderRadius: 20,
            fontWeight: 800,
            fontSize: fontSizes[rank],
            border: "1px solid rgba(245,158,11,0.22)",
          }}
        >
          <span>⭐</span>
          <span>{item.avg.toFixed(1)}</span>
          <span style={{ fontSize: "11px", opacity: 0.7, fontWeight: 600 }}>/ 5</span>
        </div>
        <span style={{ fontSize: "11px", color: "#9a3412", opacity: 0.8, fontWeight: 600 }}>
          {item.count} rating{item.count > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
