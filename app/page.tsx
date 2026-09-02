import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ComplaintForm from "@/app/dashboard/ComplaintForm";
import ProfileDropdown from "@/app/dashboard/ProfileDropdown";

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
  // expects "YYYY-MM-DD"
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");
  
  // If the user is an admin, instantly redirect them to the admin dashboard
  if (session.user.role === "ADMIN") redirect("/admin");
  
  if (!session.user.rollNo) redirect("/onboarding");

  // Fetch this student's complaints, newest first
  const complaints = await prisma.complaint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
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
                THE MESS
              </span>
              <span className="nav-logo-sub">{" "}PORTAL</span>
            </span>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown user={session.user} />
        </div>
      </header>

      {/* ── Main Content (Single Column) ── */}
      <main className="page-main">
        {/* Stats Card */}
        <div className="glass card-pad">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
            Your Stats
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
                  padding: "14px",
                  background: `${color}10`,
                  borderRadius: 10,
                  border: `1px solid ${color}30`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#78350f", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* New Complaint Form */}
        <div className="glass" style={{ padding: "28px 28px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#431407",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📢 New Complaint
          </h2>
          <p style={{ fontSize: "13px", color: "#78350f", marginBottom: "24px" }}>
            Report an issue with your mess. We take all complaints seriously.
          </p>
          <ComplaintForm mess={session.user.mess!} />
        </div>

        {/* Complaints List */}
        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#431407",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📋 My Complaints
            <span
              style={{
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                color: "white",
                fontSize: "12px",
                fontWeight: 700,
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              {complaints.length}
            </span>
          </h2>

          {complaints.length === 0 ? (
            <div
              className="glass"
              style={{
                padding: "48px 32px",
                textAlign: "center",
                color: "#78350f",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: 16 }}>🤷</div>
              <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: 6 }}>
                No complaints yet!
              </div>
              <div style={{ fontSize: "14px", opacity: 0.7 }}>
                Submit your first complaint using the form above.
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                      {/* Badges */}
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

                      {/* Status */}
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
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        color: "#431407",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        marginBottom: 10,
                      }}
                    >
                      {complaint.description}
                    </p>

                    {/* Date Created */}
                    <div style={{ fontSize: "12px", color: "#9a3412", opacity: 0.7 }}>
                      🕒 Submitted {formatDate(complaint.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
