import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ComplaintForm from "@/app/dashboard/ComplaintForm";
import ProfileDropdown from "@/app/dashboard/ProfileDropdown";
import ComplaintPhotoViewer from "@/app/admin/ComplaintPhotoViewer";

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
    timeZone: "Asia/Kolkata",
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
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");
  
  // SuperAdmins go to the dedicated superadmin portal
  if (session.user.role === "SUPER_ADMIN") redirect("/superadmin");
  
  // Admins go to the admin portal
  if (session.user.role === "ADMIN") redirect("/admin");

  // Faculty/staff with a VNIT email (non-student domain) or specific guest emails → dedicated rating page
  const userEmail = (session.user.email ?? "").toLowerCase();
  const isGuestRater = userEmail === "adityashamdire@gmail.com";
  if ((userEmail.endsWith("vnit.ac.in") && !userEmail.endsWith("students.vnit.ac.in")) || isGuestRater) {
    redirect("/rate");
  }

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

        {/* New Complaint / Rating Form */}
        <div className="glass" style={{ padding: "28px 28px" }}>
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

                return (
                  <div
                    key={complaint.id}
                    className="glass"
                    style={{ padding: "16px 18px" }}
                  >
                    {/* Top row: Details & Status/Time anchored to top right */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: "12.5px", minWidth: 0, flex: 1 }}>
                        {complaint.mess && (
                          <>
                            <span
                              style={{
                                fontWeight: 700,
                                color: complaint.mess === "VNIT Canteen" ? "#6d28d9" : "#c2410c",
                              }}
                            >
                              {complaint.mess}
                            </span>
                            <span style={{ color: "#fdba74" }}>•</span>
                          </>
                        )}
                        <span
                          style={{
                            fontWeight: 600,
                            color: catColor,
                          }}
                        >
                          {complaint.category}
                        </span>
                        <span style={{ color: "#fdba74" }}>•</span>
                        <span
                          style={{
                            fontWeight: 500,
                            color: "#9a3412",
                          }}
                        >
                          {complaint.meal}
                        </span>
                        {complaint.imageUrl && (
                          <>
                            <span style={{ color: "#fdba74" }}>•</span>
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#ea580c",
                              }}
                            >
                              Photo
                            </span>
                          </>
                        )}
                      </div>

                      {/* Top Right: Status & Time */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0, textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: complaint.resolved ? "#15803d" : "#b91c1c",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ● {complaint.resolved ? "Resolved" : "Pending"}
                        </span>
                        <div style={{ fontSize: "11px", color: "#9a3412", opacity: 0.7, whiteSpace: "nowrap" }}>
                          {formatDate(complaint.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        color: "#431407",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        marginBottom: complaint.imageUrl ? 10 : 0,
                      }}
                    >
                      {complaint.description}
                    </p>

                    {/* Photo Evidence */}
                    {complaint.imageUrl && (
                      <ComplaintPhotoViewer src={complaint.imageUrl} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
