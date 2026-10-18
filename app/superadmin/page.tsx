import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileDropdown from "@/app/dashboard/ProfileDropdown";
import SuperAdminFilterBar from "./SuperAdminFilterBar";
import ComplaintPhotoViewer from "@/app/admin/ComplaintPhotoViewer";
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

  const userEmail = (session.user.email ?? "").trim().toLowerCase();
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

  return (
    <div style={{ minHeight: "100vh", background: "#fffaf5" }}>
      {/* ── Top Nav ── */}
      <header
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #fed7aa",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="nav-inner">
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: "10px",
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
              }}
            >
              👑
            </div>
            <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px", color: "#431407" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SUPER ADMIN
              </span>
              <span className="nav-logo-sub">{" "}PORTAL</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Rate Canteen shortcut */}
            <a
              href="/rate"
              style={{
                padding: "7px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: "1.5px solid #fed7aa",
                background: "rgba(249,115,22,0.07)",
                color: "#9a3412",
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
            >
              ⭐ Rate Canteen
            </a>
            {/* View toggle */}
            <a
              href={viewAll ? "/superadmin" : "/superadmin?view=all"}
              style={{
                padding: "7px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: "1.5px solid",
                borderColor: viewAll ? "#f97316" : "#fed7aa",
                background: viewAll ? "linear-gradient(135deg,#f97316,#ef4444)" : "rgba(249,115,22,0.07)",
                color: viewAll ? "white" : "#9a3412",
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
                boxShadow: viewAll ? "0 4px 14px rgba(249,115,22,0.3)" : "none",
              }}
            >
              {viewAll ? "📋 All Complaints" : "🚨 Escalated Only"}
            </a>
            <ProfileDropdown user={session.user} isAdmin={true} />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="page-main-wide">
        {/* Stats */}
        <div className="glass card-pad">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            SuperAdmin Stats
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

        {/* Filter Bar */}
        <Suspense fallback={<div style={{ height: 64, background: "rgba(255,255,255,0.5)", borderRadius: 16 }} />}>
          <SuperAdminFilterBar viewAll={viewAll} />
        </Suspense>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#431407", display: "flex", alignItems: "center", gap: 8 }}>
            {viewAll ? "📋 All Complaints" : "🚨 Escalated Complaints"}
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
              {viewAll ? "✅" : "🚨"}
            </div>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: 6 }}>
              {viewAll ? "No complaints found!" : "No escalated complaints!"}
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              {viewAll ? "Everything is running smoothly." : "No serious complaints have been forwarded yet."}
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
                          background: complaint.mess === "Main Canteen" ? "rgba(139,92,246,0.1)" : "rgba(249,115,22,0.08)",
                          color: complaint.mess === "Main Canteen" ? "#5b21b6" : "#c2410c",
                          border: complaint.mess === "Main Canteen" ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(249,115,22,0.2)",
                        }}>
                          {complaint.mess === "Main Canteen" ? "☕" : "🍽️"} {complaint.mess ?? complaint.user.mess ?? "—"}
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
