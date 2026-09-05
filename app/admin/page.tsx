import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileDropdown from "@/app/dashboard/ProfileDropdown";
import { resolveComplaint } from "@/app/actions/admin";
import FilterBar from "./FilterBar";
import ResolveButton from "./ResolveButton";
import RegenerateButton from "./RegenerateButton";
import { getTodayCode } from "@/app/actions/dailyCode";
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

  // Role-based access control: Only ADMIN can access
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  // Build Prisma where clause from all filters
  const whereClause: any = {};
  if (params.status === "pending")  whereClause.resolved = false;
  if (params.status === "resolved") whereClause.resolved = true;

  // Mess filter
  if (params.mess) {
    whereClause.user = { ...whereClause.user, mess: params.mess };
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

  // Fetch (or auto-create) today's authority code
  const todayCode = await getTodayCode();

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

          {/* Right side of nav: code pill + profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Daily Code Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                border: "1.5px solid #fed7aa",
                borderRadius: 10,
                padding: "5px 12px 5px 10px",
                boxShadow: "0 2px 8px rgba(249,115,22,0.1)",
              }}
            >
              <span style={{ fontSize: "14px" }}>🔐</span>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#9a3412", letterSpacing: "0.05em", lineHeight: 1.2 }}>TODAY&apos;S CODE</div>
                <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#431407", letterSpacing: "4px", lineHeight: 1.2 }}>
                  {todayCode.code}
                </div>
              </div>
              <RegenerateButton />
            </div>

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
              { label: "Total",    value: complaints.length,                                  color: "#f97316" },
              { label: "Pending",  value: complaints.filter(c => !c.resolved).length,         color: "#ef4444" },
              { label: "Resolved", value: complaints.filter(c => c.resolved).length,          color: "#22c55e" },
              { label: "This Week", value: complaints.filter(c => {
                  const d = new Date(c.createdAt);
                  const now = new Date();
                  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                  return diff <= 7;
                }).length, color: "#8b5cf6" },
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
              const incDateFormatted = formatIncidentDate(complaint.incidentDate);

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
                        {incDateFormatted && (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: "12px",
                              fontWeight: 600,
                              background: "rgba(139,92,246,0.1)",
                              color: "#5b21b6",
                              border: "1px solid rgba(139,92,246,0.2)",
                            }}
                          >
                            📅 {incDateFormatted}
                          </span>
                        )}
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
                            : "rgba(239,68,68,0.10)",
                          color: complaint.resolved ? "#15803d" : "#b91c1c",
                          border: `1px solid ${complaint.resolved ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {complaint.resolved ? "✅ Resolved" : "⏳ Pending"}
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
                      marginBottom: 16,
                    }}
                  >
                    {complaint.description}
                  </p>

                  {/* Action Button */}
                  {!complaint.resolved && (
                    <div className="border-t border-orange-100 pt-4 flex justify-end">
                      <ResolveButton
                        complaintId={complaint.id}
                        resolveAction={resolveComplaint}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ textAlign: "center", padding: "24px", color: "#9a3412", fontSize: "14px", fontWeight: 600, opacity: 0.8 }}>
        Powered By <span style={{ fontWeight: 800, color: "#f97316" }}>Nexalaya</span>
      </footer>
    </div>
  );
}
