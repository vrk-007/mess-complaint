"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Background orbs - Foody colors */}
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "rgba(249, 115, 22, 0.15)", /* Orange */
          top: "-150px",
          right: "-150px",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          background: "rgba(234, 179, 8, 0.15)", /* Yellow */
          bottom: "-100px",
          left: "-100px",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 300,
          height: 300,
          background: "rgba(239, 68, 68, 0.1)", /* Red */
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Card */}
      <div
        className="glass auth-card"
        style={{ textAlign: "center" }}
      >
        {error === "AccessDenied" ? (
          /* ── Access Denied State ── */
          <>
            {/* Lock icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "24px",
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 28px",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
              }}
            >
              🔒
            </div>

            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#431407",
                marginBottom: "12px",
                letterSpacing: "-0.3px",
              }}
            >
              Only College Emails Are Allowed
            </h2>

            <p
              style={{
                color: "#78350f",
                fontSize: "14px",
                lineHeight: 1.7,
                marginBottom: "32px",
              }}
            >
              Please use your{" "}
              <strong style={{ color: "#f97316" }}>@students.vnit.ac.in</strong>{" "}
              Google account to sign in.
            </p>

            {/* Try Again button — same theme */}
            <button
              className="btn-primary"
              onClick={handleLogin}
              style={{ width: "100%", padding: "16px 24px", fontSize: "16px" }}
              id="google-signin-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Try Again
            </button>
          </>
        ) : (
          /* ── Normal Login State ── */
          <>
            {/* Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "24px",
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 28px",
                boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
              }}
            >
              🍽️
            </div>

            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginBottom: "12px",
                letterSpacing: "-0.5px",
                color: "#431407",
              }}
            >
              <span className="gradient-text">THE MESS</span>
              <br />
              PORTAL
            </h1>

            <p
              style={{
                color: "#78350f",
                fontSize: "15px",
                marginBottom: "40px",
                lineHeight: 1.6,
              }}
            >
              Sign in with your College Google Account to submit and track mess
              complaints.
            </p>

            <button
              className="btn-primary"
              onClick={handleLogin}
              disabled={loading}
              style={{ width: "100%", padding: "16px 24px", fontSize: "16px" }}
              id="google-signin-btn"
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".9"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity=".8"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </>
        )}

        <div style={{ marginTop: "24px", textAlign: "center" }}>
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
                animation: "nexalaya-shine 2.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            Powered By{" "}
            <span style={{ fontWeight: 800, color: "#f97316", marginLeft: 4 }}>Nexalaya</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nexalaya-shine {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
