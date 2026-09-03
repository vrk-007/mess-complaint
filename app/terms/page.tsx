import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Mess Complaint Portal",
  description: "Terms of Service for Mess Complaint Portal by Nexalaya.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: "#78350f", marginBottom: 28 }}>
          Last updated: September 2026
        </p>

        <section style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 15, lineHeight: 1.7 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the <strong>Mess Complaint Portal</strong>, you agree to comply with and be bound by these Terms of Service.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>2. User Conduct & Responsible Use</h2>
            <p>
              You agree to submit accurate and truthful feedback regarding mess meals, cleanliness, and services. You agree NOT to:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Submit abusive, defamatory, profane, or harassing language.</li>
              <li>Spam the system with repetitive, automated, or fraudulent complaints.</li>
              <li>Attempt to bypass rate limits or compromise server infrastructure.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>3. Account Termination</h2>
            <p>
              Portal administrators reserve the right to suspend or revoke access to users who misuse or spam the feedback system.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>4. Disclaimer</h2>
            <p>
              This portal serves as a communication and feedback bridge between students and mess administration. Resolution times and operational changes remain the responsibility of hostel and mess authorities.
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
