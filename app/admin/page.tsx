import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileDropdown from "@/app/dashboard/ProfileDropdown";
import FilterBar from "./FilterBar";
import ResolveModal from "./ResolveModal";
import ApprovalActions from "./ApprovalActions";
import EscalateButton from "./EscalateButton";
import RemarkBox from "./RemarkBox";
import QRModal from "./QRModal";
import ComplaintPhotoViewer from "./ComplaintPhotoViewer";
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
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatIncidentDate(dateString: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mess?: string; period?: string; date?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // Role-based access control: Only ADMIN (or SUPER_ADMIN) can access
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/");

  // Determine if this admin can escalate complaints
  const escalateEmails = (process.env.ESCALATE_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const canEscalate = escalateEmails.includes(
    (session.user.email ?? "").trim().toLowerCase()
  );

  // Build Prisma where clause from all filters
  const whereClause: any = {};
  if (params.status === "pending")  whereClause.resolved = false;
  if (params.status === "resolved") whereClause.resolved = true;

  // Mess filter — now on complaint.mess directly
  if (params.mess) {
    whereClause.mess = params.mess;
  }

  // Date / Period filter
  if (params.date) {
    // Specific calendar date
    const start = new Date(params.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(params.date);
    end.setHours(23, 59, 59, 999);
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

  // Fetch all complaints with user info attached
  const complaints = await prisma.complaint.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, rollNo: true, hostel: true, mess: true },
      },
    },
  });

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
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
              }}
            >
              🍽️
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "18px",
                letterSpacing: "-0.5px",
                color: "#431407",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ADMIN
              </span>
              <span className="nav-logo-sub">{" "}PORTAL</span>
            </span>
          </div>

          {/* Right side of nav: QR button + profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <QRModal />

            <ProfileDropdown user={session.user} isAdmin={true} />
          </div>
        </div>
      </header>


      {/* ── Main Content ── */}
      <main className="page-main-wide">
        {/* Stats Card (Same as Student) */}
        <div className="glass card-pad">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            System Stats
          </div>
          <div className="stats-grid">
            {[
              { label: "Total",           value: complaints.length,                                            color: "#f97316" },
              { label: "Active",           value: complaints.filter(c => !c.resolved && !c.pendingApproval).length, color: "#ef4444" },
              { label: "Pending Approval", value: complaints.filter(c => c.pendingApproval).length,              color: "#f59e0b" },
              { label: "Resolved",         value: complaints.filter(c => c.resolved).length,                     color: "#22c55e" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  padding: "10px",
                  background: `${color}10`,
                  borderRadius: 12,
                  border: `1px solid ${color}30`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "10px", color: "#78350f", fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <Suspense fallback={<div style={{ height: 64, background: "rgba(255,255,255,0.5)", borderRadius: 16 }} />}>
          <FilterBar />
        </Suspense>

        {/* ── Complaints Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#431407", display: "flex", alignItems: "center", gap: 8 }}>
            📋 Complaints
          </h2>
          <span
            style={{
              background: "linear-gradient(135deg,#f97316,#ef4444)",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 20,
            }}
          >
            {complaints.length}
          </span>
        </div>

        {/* Complaints List (Card Style) */}
        {complaints.length === 0 ? (
          <div
            className="glass"
            style={{
              padding: "48px 32px",
              textAlign: "center",
              color: "#78350f",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: 16 }}>✅</div>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: 6 }}>
              No complaints found!
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              Everything is running smoothly.
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
                  style={{ padding: "20px 22px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    {/* Student Name & Badges */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontWeight: 500, color: "#78350f", fontSize: "14px", display: "flex", alignItems: "center", gap: 8 }}>
                        👤 {complaint.user.name}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {/* Venue badge */}
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: "12px",
                            fontWeight: 700,
                            background: complaint.mess === "Main Canteen"
                              ? "rgba(139,92,246,0.1)"
                              : "rgba(249,115,22,0.08)",
                            color: complaint.mess === "Main Canteen" ? "#5b21b6" : "#c2410c",
                            border: complaint.mess === "Main Canteen"
                              ? "1px solid rgba(139,92,246,0.25)"
                              : "1px solid rgba(249,115,22,0.2)",
                          }}
                        >
                          {complaint.mess === "Main Canteen" ? "☕" : "🍽️"} {complaint.mess ?? complaint.user.mess ?? "—"}
                        </span>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: "12px",
                            fontWeight: 700,
                            background: `${catColor}18`,
                            color: catColor,
                            border: `1px solid ${catColor}40`,
                          }}
                        >
                          {complaint.category}
                        </span>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "rgba(249,115,22,0.1)",
                            color: "#c2410c",
                            border: "1px solid rgba(249,115,22,0.2)",
                          }}
                        >
                          {mealIcon} {complaint.meal}
                        </span>

                      </div>
                    </div>

                    {/* Status & Date */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: "12px",
                          fontWeight: 700,
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
                        }}
                      >
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
                  <p
                    style={{
                      color: "#431407",
                      fontSize: "15px",
                      fontWeight: 700,
                      lineHeight: 1.6,
                      marginBottom: complaint.imageUrl ? 12 : 16,
                    }}
                  >
                    {complaint.description}
                  </p>

                  {/* Photo Evidence — direct display, click to zoom */}
                  {complaint.imageUrl && (
                    <ComplaintPhotoViewer src={complaint.imageUrl} />
                  )}

                  {/* Remarks Box */}
                  <RemarkBox
                    complaintId={complaint.id}
                    existingRemark={complaint.adminRemark}
                    remarkBy={complaint.remarkBy}
                    remarkAt={complaint.remarkAt}
                  />

                  {/* ── Approval Actions (Escalators only, when complaint is pending approval) ── */}
                  {canEscalate && complaint.pendingApproval && !complaint.resolved && (
                    <div style={{ marginTop: 4 }}>
                      <ApprovalActions
                        complaintId={complaint.id}
                        resolvedBy={complaint.resolvedBy}
                        resolutionRemark={complaint.resolutionRemark}
                      />
                    </div>
                  )}

                  {/* ── Pending Approval notice for non-escalators ── */}
                  {!canEscalate && complaint.pendingApproval && !complaint.resolved && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "10px 14px",
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: 12,
                        fontSize: 13,
                        color: "#92400e",
                        fontWeight: 600,
                      }}
                    >
                      ⏳ Resolution submitted — waiting for senior admin approval.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-orange-100 pt-4 flex justify-end gap-3 flex-wrap">
                    {canEscalate && (
                      <EscalateButton
                        complaintId={complaint.id}
                        isAlreadyForwarded={complaint.isForwarded}
                        forwardedBy={complaint.forwardedBy}
                        forwardNote={complaint.forwardNote}
                      />
                    )}
                    {/* Only show Resolve button if NOT already resolved and NOT already pending approval */}
                    {!complaint.resolved && !complaint.pendingApproval && (
                      <ResolveModal complaintId={complaint.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: "center",
          padding: "32px 24px",
          borderTop: "1px solid rgba(254,215,170,0.4)",
        }}
      >
        <style>{`
          @keyframes nexalaya-shine {
            0%   { transform: translateX(-150%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            padding: "8px 20px",
            borderRadius: "50px",
            border: "1px solid rgba(249,115,22,0.25)",
            background: "rgba(249,115,22,0.05)",
            boxShadow: "0 0 18px rgba(249,115,22,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
            fontSize: "14px",
            fontWeight: 600,
            color: "#9a3412",
            gap: 4,
          }}
        >
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
              animation: "nexalaya-shine 2.6s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          Powered By{""}
          <span style={{ fontWeight: 800, color: "#f97316", marginLeft: 4 }}>Nexalaya</span>
        </div>
      </footer>
    </div>
  );
}
