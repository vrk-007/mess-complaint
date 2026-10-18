import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RateProfileDropdown from "./RateProfileDropdown";
import CanteenRatingForm from "./CanteenRatingForm";

export default async function RatePage() {
  const session = await auth();

  // Must be logged in
  if (!session) redirect("/login");

  // Regular ADMIN → admin portal (admins don't need this page)
  if (session.user.role === "ADMIN") redirect("/admin");

  // Students (students.vnit.ac.in) → main dashboard
  const userEmail = (session.user.email ?? "").toLowerCase();
  if (userEmail.endsWith("students.vnit.ac.in")) redirect("/");

  // Only VNIT emails (faculty, staff, superadmin) or specific guest emails allowed here
  const isGuestRater = userEmail === "adityashamdire@gmail.com";
  if (!userEmail.endsWith("vnit.ac.in") && session.user.role !== "SUPER_ADMIN" && !isGuestRater) {
    redirect("/login");
  }

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

          {/* Profile Dropdown */}
          <RateProfileDropdown user={session.user} />
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
              Welcome !
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
