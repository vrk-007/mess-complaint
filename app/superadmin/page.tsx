import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileDropdown from "@/app/dashboard/ProfileDropdown";
import SuperAdminFilterBar from "./SuperAdminFilterBar";
import ComplaintPhotoViewer from "@/app/admin/ComplaintPhotoViewer";
import CanteenAnalytics, { CanteenAnalyticsProps } from "@/app/admin/CanteenAnalytics";
import { Suspense } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  "Food Quality": "#f97316",
  "Hygiene":      "#ef4444",
  "Quantity":     "#f59e0b",
  "Service":      "#8b5cf6",
  "Other":        "#6b7280",
};

const MEAL_ICONS: Record<string, string> = {
  Breakfast: "🌅",
  Lunch:     "☀️",
  Snacks:    "🍪",
  Dinner:    "🌙",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

export default async function SuperAdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mess?: string; period?: string; date?: string; view?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // ── Auth: only SUPER_ADMIN_EMAILS can access ──────────────────────────────
  if (!session) redirect("/login");

  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (session.user?.email ?? "").trim().toLowerCase();
  if (!superAdminEmails.includes(userEmail)) redirect("/");

  // ── Build where clause ────────────────────────────────────────────────────
  const viewAll = params.view === "all";
  const whereClause: any = {};

  // By default show only escalated complaints; "all" shows everything
  if (!viewAll) whereClause.isForwarded = true;

  if (params.status === "pending")  whereClause.resolved = false;
  if (params.status === "resolved") whereClause.resolved = true;
  if (params.mess) whereClause.mess = params.mess;

  if (params.date) {
    const start = new Date(params.date); start.setHours(0, 0, 0, 0);
    const end   = new Date(params.date); end.setHours(23, 59, 59, 999);
    whereClause.createdAt = { gte: start, lte: end };
  } else if (params.period) {
    const now = new Date();
    const daysMap: Record<string, number> = { "1w": 7, "2w": 14, "1m": 30 };
    const days = daysMap[params.period];
    if (days) {
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      whereClause.createdAt = { gte: from };
    }
  }

  const complaints = await prisma.complaint.findMany({
    where: whereClause,
    // Escalated view: most recently escalated first; All view: most recently created first
    orderBy: viewAll ? { createdAt: "desc" } : { forwardedAt: "desc" },
    include: {
      user: { select: { name: true, rollNo: true, hostel: true, mess: true } },
    },
  });

  const totalEscalated = await prisma.complaint.count({ where: { isForwarded: true } });

  const isCanteen = params.mess === "VNIT Canteen";
  let canteenAnalyticsData: CanteenAnalyticsProps | null = null;

  if (isCanteen) {
    const now = new Date();
    // 1. Monthly Ratings for Top 3 and Lowest Rated items
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRatings = await prisma.canteenRating.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { item: true, rating: true },
    });

    const itemMonthlyMap: Record<string, { total: number; count: number }> = {};
    for (const r of monthlyRatings) {
      if (!itemMonthlyMap[r.item]) itemMonthlyMap[r.item] = { total: 0, count: 0 };
      itemMonthlyMap[r.item].total += r.rating;
      itemMonthlyMap[r.item].count += 1;
    }

    const itemsArray = Object.entries(itemMonthlyMap).map(([item, stat]) => ({
      item,
      avg: Number((stat.total / stat.count).toFixed(1)),
      count: stat.count,
    }));

    // Top rated: Only items with avg >= 3.0 stars (Best performers, max 3)
    const topRated = itemsArray
      .filter((item) => item.avg >= 3.0)
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 3);

    // Lowest rated: Only items with avg < 3.0 stars (Needs improvement, max 3)
    const worstRatedRaw = itemsArray
      .filter((item) => item.avg < 3.0)
      .sort((a, b) => a.avg - b.avg || b.count - a.count)
      .slice(0, 3);

    // Fetch latest student remarks/reviews for each worst-rated item
    const worstRated = await Promise.all(
      worstRatedRaw.map(async (w) => {
        const reviews = await prisma.canteenRating.findMany({
          where: {
            item: w.item,
            comment: { not: null },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        });
        const validReviews = reviews
          .filter((r) => r.comment && r.comment.trim().length > 0)
          .map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment as string,
            createdAt: r.createdAt.toISOString(),
          }));
        return {
          ...w,
          recentReviews: validReviews,
        };
      })
    );

    // 2. All ratings (unfiltered) for client-side period filtering in the Daily Ratings section
    const allRatingsRaw = await prisma.canteenRating.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        item: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    const allRatings = allRatingsRaw.map((r) => ({
      id: r.id,
      item: r.item,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

    canteenAnalyticsData = {
      topRated,
      worstRated,
      allRatings,
    };
  }

  // Preserve filters when toggling views
  const toggleQuery = new URLSearchParams();
  if (params.mess) toggleQuery.set("mess", params.mess);
  if (params.status) toggleQuery.set("status", params.status);
  if (params.period) toggleQuery.set("period", params.period);
  if (params.date) toggleQuery.set("date", params.date);
  if (!viewAll) toggleQuery.set("view", "all");
  const toggleHref = toggleQuery.toString() ? `/superadmin?${toggleQuery.toString()}` : "/superadmin";

  return (
    <div style={{ minHeight: "100vh", background: "#fffaf5" }}>
      {/* ── Nav styles: orange chips, always visible on mobile ── */}
      <style>{`
        .sa-nav-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-decoration: none;
          white-space: nowrap;
          transition: filter 0.18s ease, box-shadow 0.18s ease;
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: #fff !important;
          border: none;
          box-shadow: 0 2px 8px rgba(249,115,22,0.30);
          -webkit-tap-highlight-color: transparent;
        }
        .sa-nav-chip:hover { filter: brightness(1.08); box-shadow: 0 4px 14px rgba(249,115,22,0.45); }
        .sa-nav-chip:active { filter: brightness(1.0); }

        .sa-nav-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* Tighten up on small phones — keep text visible */
        @media (max-width: 400px) {
          .sa-nav-chip { padding: 5px 8px; font-size: 11px; gap: 3px; }
          .sa-nav-right { gap: 5px; }
        }
      `}</style>

      {/* ── Top Nav ── */}
      <header
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #fed7aa",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="nav-inner" style={{ height: 56 }}>
          {/* 🍽️ Mess icon — compact logo mark, no text */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
                boxShadow: "0 3px 10px rgba(249,115,22,0.28)",
              }}
            >
              🍽️
            </div>
          </div>

          {/* Right side: Rate Canteen + All Complaints toggle + Profile */}
          <div className="sa-nav-right">
            {/* ⭐ Rate Canteen */}
            <a href="/rate" title="Rate VNIT Canteen" className="sa-nav-chip">
              <span style={{ fontSize: 13 }}>⭐</span>
              Rate Canteen
            </a>

            {/* 📋 / 🚨 View toggle */}
            <a
              href={toggleHref}
              title={viewAll ? "Switch to Escalated Only" : "Switch to All Complaints"}
              className="sa-nav-chip"
            >
              <span style={{ fontSize: 13 }}>{viewAll ? "📋" : "🚨"}</span>
              {viewAll ? "All Complaints" : "Escalated Only"}
            </a>

            <ProfileDropdown user={session.user} isAdmin={true} />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="page-main-wide">

        {/* ── Step 1: Select Mess ── */}
        <Suspense fallback={<div style={{ height: 64, background: "rgba(255,255,255,0.5)", borderRadius: 16 }} />}>
          <SuperAdminFilterBar viewAll={viewAll} section="mess" />
        </Suspense>

        {/* ── Step 2: Stats Card (non-Canteen only) ── */}
        {!isCanteen && (
          <div className="glass card-pad">
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Mess Complaints Stats
            </div>
            <div className="stats-grid">
              {[
                { label: "Total Escalated",   value: totalEscalated,                                              color: "#f97316" },
                { label: "Showing Now",        value: complaints.length,                                           color: "#8b5cf6" },
                { label: "Pending Approval",   value: complaints.filter(c => c.pendingApproval).length,            color: "#f59e0b" },
                { label: "Resolved",           value: complaints.filter(c => c.resolved).length,                   color: "#22c55e" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: "10px", background: `${color}10`, borderRadius: 12, border: `1px solid ${color}30`, textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: "10px", color: "#78350f", fontWeight: 700 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Filter hint + period/date/status filters (non-Canteen only) ── */}
        {!isCanteen && (
          <>
            <div
              style={{
                fontSize: "12.5px",
                color: "#9a3412",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                width: "fit-content",
                maxWidth: "100%",
                padding: "6px 12px",
                background: "rgba(249,115,22,0.06)",
                border: "1px solid rgba(249,115,22,0.18)",
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 14 }}>ℹ️</span>
              <span>
                From below filter, you can see All, past 1 week, past 2 week, Past 1 month{" "}
                <strong>complaints/suggestions</strong> and by date 📆 as well
              </span>
            </div>
            <Suspense fallback={<div style={{ height: 64, background: "rgba(255,255,255,0.5)", borderRadius: 16 }} />}>
              <SuperAdminFilterBar viewAll={viewAll} section="filters" />
            </Suspense>
          </>
        )}

        {/* ── Canteen Analytics (Above Suggestions when VNIT Canteen is filtered) ── */}
        {isCanteen && canteenAnalyticsData && (
          <CanteenAnalytics {...canteenAnalyticsData} />
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#431407", display: "flex", alignItems: "center", gap: 8 }}>
            {isCanteen ? "💡 Suggestions" : viewAll ? "📋 All Complaints" : "🚨 Escalated Complaints"}
          </h2>
          <span style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", color: "white", fontSize: "12px", fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
            {complaints.length}
          </span>
        </div>

        {/* Complaint Cards */}
        {complaints.length === 0 ? (
          <div
            className="glass"
            style={{ padding: "48px 32px", textAlign: "center", color: "#78350f" }}
          >
            <div style={{ fontSize: "48px", marginBottom: 16 }}>
              {isCanteen ? "💡" : viewAll ? "✅" : "🚨"}
            </div>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: 6 }}>
              {isCanteen ? "No suggestions found!" : viewAll ? "No complaints found!" : "No escalated complaints!"}
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              {isCanteen ? "No suggestions have been submitted for VNIT Canteen." : viewAll ? "Everything is running smoothly." : "No serious complaints have been forwarded yet."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {complaints.map((complaint) => {
              const catColor = CATEGORY_COLORS[complaint.category] ?? "#6b7280";
              const mealIcon = MEAL_ICONS[complaint.meal] ?? "🍴";

              return (
                <div
                  key={complaint.id}
                  className="glass"
                  style={{
                    padding: "20px 22px",
                  }}
                >

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    {/* Student Name & Badges */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontWeight: 500, color: "#78350f", fontSize: "14px", display: "flex", alignItems: "center", gap: 8 }}>
                        👤 {complaint.user.name}
                        {complaint.user.rollNo && (
                          <span style={{ fontSize: 12, color: "#9a3412", opacity: 0.7 }}>({complaint.user.rollNo})</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {/* Venue badge */}
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: "12px", fontWeight: 700,
                          background: complaint.mess === "VNIT Canteen" ? "rgba(139,92,246,0.1)" : "rgba(249,115,22,0.08)",
                          color: complaint.mess === "VNIT Canteen" ? "#5b21b6" : "#c2410c",
                          border: complaint.mess === "VNIT Canteen" ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(249,115,22,0.2)",
                        }}>
                          {complaint.mess === "VNIT Canteen" ? "☕" : "🍽️"} {complaint.mess ?? complaint.user.mess ?? "—"}
                        </span>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "12px", fontWeight: 700, background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}40` }}>
                          {complaint.category}
                        </span>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "12px", fontWeight: 600, background: "rgba(249,115,22,0.1)", color: "#c2410c", border: "1px solid rgba(249,115,22,0.2)" }}>
                          {mealIcon} {complaint.meal}
                        </span>
                        {complaint.user.hostel && (
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "12px", fontWeight: 600, background: "rgba(249,115,22,0.07)", color: "#9a3412", border: "1px solid rgba(249,115,22,0.15)" }}>
                            🏠 {complaint.user.hostel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Date */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: 20, fontSize: "12px", fontWeight: 700,
                        background: complaint.resolved
                          ? "rgba(34,197,94,0.12)"
                          : complaint.pendingApproval
                          ? "rgba(245,158,11,0.12)"
                          : "rgba(239,68,68,0.10)",
                        color: complaint.resolved
                          ? "#15803d"
                          : complaint.pendingApproval
                          ? "#92400e"
                          : "#b91c1c",
                        border: `1px solid ${
                          complaint.resolved
                            ? "rgba(34,197,94,0.3)"
                            : complaint.pendingApproval
                            ? "rgba(245,158,11,0.35)"
                            : "rgba(239,68,68,0.25)"
                        }`,
                        whiteSpace: "nowrap",
                      }}>
                        {complaint.resolved
                          ? "✅ Resolved"
                          : complaint.pendingApproval
                          ? "⏳ Pending Approval"
                          : "🔴 Active"}
                      </span>
                      <div style={{ fontSize: "11px", color: "#9a3412", opacity: 0.7 }}>
                        🕒 {formatDate(complaint.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ color: "#431407", fontSize: "15px", fontWeight: 700, lineHeight: 1.6, marginBottom: complaint.imageUrl ? 12 : 4 }}>
                    {complaint.description}
                  </p>

                  {/* Escalation note (if any) */}
                  {complaint.forwardNote && (
                    <div style={{
                      marginBottom: 12,
                      padding: "8px 14px",
                      background: "rgba(249,115,22,0.06)",
                      border: "1px solid rgba(249,115,22,0.2)",
                      borderRadius: 10,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#9a3412" }}>🚨 Escalation note: </span>
                      <span style={{ fontSize: 13, color: "#431407" }}>{complaint.forwardNote}</span>
                    </div>
                  )}

                  {/* Photo */}
                  {complaint.imageUrl && <ComplaintPhotoViewer src={complaint.imageUrl} />}


                  {/* Resolution note visible on SuperAdmin (read-only) */}
                  {complaint.pendingApproval && complaint.resolutionRemark && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "10px 14px",
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: 12,
                        fontSize: 13,
                        color: "#92400e",
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>⏳ Resolution pending approval:</span>{" "}
                      {complaint.resolutionRemark}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "32px 24px", borderTop: "1px solid rgba(254,215,170,0.4)" }}>
        <style>{`
          @keyframes nexalaya-shine-sa {
            0%   { transform: translateX(-150%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
        <div
          style={{
            display: "inline-flex", alignItems: "center", position: "relative", overflow: "hidden",
            padding: "8px 20px", borderRadius: "50px",
            border: "1px solid rgba(249,115,22,0.25)",
            background: "rgba(249,115,22,0.05)",
            boxShadow: "0 0 18px rgba(249,115,22,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
            fontSize: "14px", fontWeight: 600, color: "#9a3412", gap: 4,
          }}
        >
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
              animation: "nexalaya-shine-sa 2.6s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          Powered By{" "}
          <span style={{ fontWeight: 800, color: "#f97316", marginLeft: 4 }}>Nexalaya</span>
        </div>
      </footer>
    </div>
  );
}
