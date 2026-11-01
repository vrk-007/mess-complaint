import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RateProfileDropdown from "./RateProfileDropdown";
import CanteenRatingForm from "./CanteenRatingForm";

export default async function RatePage() {
  const session = await auth();
  const isGuest = !session;

  const userEmail = (session?.user?.email ?? "").toLowerCase();

  // SuperAdmin detection for back to portal option
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isSuperAdmin = !isGuest && (session?.user?.role === "SUPER_ADMIN" || superAdminEmails.includes(userEmail));
  const isAdmin = !isGuest && session?.user?.role === "ADMIN";
  const isStudent = !isGuest && (userEmail.endsWith("students.vnit.ac.in") || session?.user?.role === "STUDENT");

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
                THE CANTEEN
              </span>
              <span className="nav-logo-sub">{" "}PORTAL</span>
            </span>
          </div>

          {/* Profile Dropdown or Guest Exit */}
          {!isGuest && session?.user ? (
            <RateProfileDropdown user={session.user} />
          ) : (
            <a
              href="/login"
              title="Exit to Login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 12,
                fontSize: "13px",
                fontWeight: 700,
                border: "1.5px solid #fed7aa",
                background: "#ffffff",
                color: "#9a3412",
                textDecoration: "none",
                boxShadow: "0 2px 6px rgba(249, 115, 22, 0.08)",
                transition: "all 0.2s ease",
              }}
            >
              <span>🚪</span>
              <span>Exit</span>
            </a>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="page-main">

        {/* Welcome Card */}
        <div
          className="glass"
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
              border: "1.5px solid #fed7aa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(249,115,22,0.12)",
            }}
          >
            👋
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#431407" }}>
              {isGuest ? "Welcome, Guest!" : "Welcome !"}
            </div>
            <div style={{ fontSize: "13px", color: "#9a3412", marginTop: 2 }}>
              Share your feedback on canteen food to help us improve quality.
            </div>
          </div>
        </div>

        {/* Rating Card — same visual as ComplaintForm canteen rating section */}
        <div className="glass" style={{ padding: "28px 28px" }}>
          <CanteenRatingForm />
        </div>

        {/* Exit option for Guest */}
        {isGuest && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <a
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 14,
                fontSize: "14px",
                fontWeight: 700,
                border: "1.5px solid #fed7aa",
                background: "rgba(255, 255, 255, 0.85)",
                color: "#9a3412",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.08)",
                transition: "all 0.2s ease",
              }}
            >
              <span>←</span>
              <span>Exit (Back to Login)</span>
            </a>
          </div>
        )}

        {/* Back to Portal (SuperAdmin, Admin, or Student) */}
        {!isGuest && (isSuperAdmin || isAdmin || isStudent) && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <a
              href={isSuperAdmin ? "/superadmin" : isAdmin ? "/admin" : "/"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 14,
                fontSize: "14px",
                fontWeight: 700,
                border: "1.5px solid #fed7aa",
                background: "rgba(255, 255, 255, 0.85)",
                color: "#9a3412",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.08)",
                transition: "all 0.2s ease",
              }}
            >
              <span>←</span>
              <span>
                {isSuperAdmin
                  ? "Back to Super Admin Portal"
                  : isAdmin
                  ? "Back to Admin Portal"
                  : "Back to Dashboard"}
              </span>
            </a>
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
          @keyframes nexalaya-shine-rate {
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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
              animation: "nexalaya-shine-rate 2.6s ease-in-out infinite",
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
