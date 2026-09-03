import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Mess Complaint Portal",
  description: "Privacy Policy for Mess Complaint Portal by Nexalaya.",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fffaf5",
        padding: "48px 24px",
        fontFamily: "inherit",
        color: "#431407",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid #fed7aa",
          borderRadius: 24,
          padding: "36px",
          boxShadow: "0 10px 30px rgba(120, 53, 15, 0.05)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 600,
            color: "#f97316",
            textDecoration: "none",
          }}
        >
          ← Back to Portal
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: "#9a3412" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "#78350f", marginBottom: 28 }}>
          Last updated: September 2026
        </p>

        <section style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 15, lineHeight: 1.7 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1. Introduction</h2>
            <p>
              Welcome to the <strong>Mess Complaint Portal</strong> (powered by Nexalaya). We respect your privacy and are committed to protecting the personal information you share with us.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>2. Information We Collect</h2>
            <p>
              When you sign in using Google OAuth and use our portal, we collect minimal information necessary to deliver our service:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Google Account Data:</strong> Your name, email address, and profile picture provided via Google OAuth.</li>
              <li><strong>Student Details:</strong> Your Roll Number, Hostel, and Mess preference provided during onboarding.</li>
              <li><strong>Complaint Details:</strong> Feedback, descriptions, meal categories, and timestamps submitted by you.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>3. How We Use Your Information</h2>
            <p>Your information is used strictly to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Verify your identity as an enrolled student or hostel resident.</li>
              <li>Track, categorize, and resolve mess-related feedback and complaints.</li>
              <li>Provide aggregated mess quality metrics to mess administrations.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>4. Data Protection & Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. Your data is stored securely using industry-standard cloud databases with encrypted connections.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, you can reach out through your institution&apos;s mess representative or via our portal administration.
            </p>
          </div>
        </section>

        <div style={{ marginTop: 40, borderTop: "1px solid #fed7aa", paddingTop: 20, textAlign: "center", fontSize: 13, color: "#9a3412" }}>
          Powered by Nexalaya
        </div>
      </div>
    </main>
  );
}
