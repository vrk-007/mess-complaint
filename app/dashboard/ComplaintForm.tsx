"use client";

import { useState, lazy, Suspense } from "react";
import { submitComplaint } from "@/app/actions/complaint";

const QRScanner = lazy(() => import("./QRScanner"));

const DESC_MAX = 500;
const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const MEAL_ICONS: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Snacks: "🍪", Dinner: "🌙" };

const CATEGORIES = ["Food Quality", "Hygiene", "Quantity", "Service", "Other"];
const CAT_ICONS: Record<string, string> = {
  "Food Quality": "🍲", "Hygiene": "🧼", "Quantity": "⚖️", "Service": "🛎️", "Other": "📌"
};

export default function ComplaintForm({ mess }: { mess: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [descLen, setDescLen] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // QR verification state
  const [qrToken, setQrToken] = useState("");          // the scanned token string
  const [qrVerified, setQrVerified] = useState(false); // true after successful scan
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (token: string) => {
    setQrToken(token);
    setQrVerified(true);
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedMeal)    return setErrorMsg("Please select a meal.");
    if (!selectedCategory) return setErrorMsg("Please select a category.");
    if (!qrVerified || !qrToken) return setErrorMsg("Please scan the Mess Authority QR code first.");

    const formData = new FormData(e.currentTarget);
    formData.set("qrToken", qrToken); // inject scanned token
    const form = e.currentTarget;

    setIsPending(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      await submitComplaint(formData);
      setStatus("success");
      form.reset();
      setSelectedMeal("");
      setSelectedCategory("");
      setDescLen(0);
      setQrToken("");
      setQrVerified(false);
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        {/* Mess (read-only, auto-filled) */}
        <div>
          <label className="label">Your Mess</label>
          <div
            style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
              border: "1px solid #fed7aa",
              borderRadius: "14px",
              color: "#9a3412",
              fontWeight: 700,
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
            }}
          >
            🍽️ {mess}
          </div>
        </div>

        {/* Meal Selection (Pills) */}
        <div>
          <label className="label">Meal</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {MEALS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMeal(m)}
                className={`complaint-pill meal-pill ${selectedMeal === m ? "active" : ""}`}
                style={{
                  flex: "1 1 calc(50% - 10px)",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: "16px" }}>{MEAL_ICONS[m]}</span> {m}
              </button>
            ))}
          </div>
          <input type="hidden" name="meal" value={selectedMeal} />
        </div>

        {/* Category Selection (Pills) */}
        <div>
          <label className="label">Category</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`complaint-pill category-pill ${selectedCategory === c ? "active" : ""}`}
                style={{
                  flex: "1 1 auto",
                  padding: "10px 16px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{CAT_ICONS[c]}</span> {c}
              </button>
            ))}
          </div>
          <input type="hidden" name="category" value={selectedCategory} />
        </div>

        {/* Incident Date */}
        <div>
          <label htmlFor="incidentDate" className="label">Date of Incident</label>
          <div style={{ position: "relative" }}>
            <input
              id="incidentDate"
              name="incidentDate"
              type="date"
              required
              className="input"
              style={{
                paddingLeft: "42px",
                cursor: "pointer",
                color: "#431407",
                fontWeight: 600,
              }}
            />
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "18px" }}>
              📅
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={DESC_MAX}
            rows={4}
            placeholder="Describe your complaint in detail…"
            className="input"
            style={{ resize: "vertical", lineHeight: 1.6 }}
            onChange={(e) => setDescLen(e.target.value.length)}
          />
          <div style={{
            textAlign: "right",
            fontSize: "12px",
            marginTop: "4px",
            fontWeight: 600,
            color: descLen > DESC_MAX * 0.9 ? (descLen >= DESC_MAX ? "#dc2626" : "#d97706") : "#a8a29e",
            transition: "color 0.2s ease",
          }}>
            {descLen} / {DESC_MAX}
          </div>
        </div>

        {/* ── QR Authority Verification ─────────────────────────────────── */}
        <div>
          <label className="label">🔐 Mess Authority Verification</label>

          {qrVerified ? (
            /* Verified state */
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "rgba(34,197,94,0.08)",
                border: "1.5px solid rgba(34,197,94,0.35)",
                borderRadius: 14,
              }}
            >
              <span style={{ fontSize: "24px" }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>
                  Mess Authority Verified
                </div>
                <div style={{ fontSize: "12px", color: "#16a34a", marginTop: 2 }}>
                  QR scanned successfully — you may now submit
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setQrVerified(false); setQrToken(""); }}
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Re-scan
              </button>
            </div>
          ) : (
            /* Scan button */
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                border: "2px dashed #fed7aa",
                background: "#fff7ed",
                color: "#9a3412",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#ffedd5";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#fb923c";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#fff7ed";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#fed7aa";
              }}
            >
              <span style={{ fontSize: "22px" }}>📷</span>
              Scan Mess QR to Verify
            </button>
          )}

          <div style={{ fontSize: "12px", color: "#78350f", marginTop: 6, fontWeight: 500 }}>
            The on-duty Mess or Canteen Coordinator will show you the QR to scan.
          </div>
        </div>

        {/* Status messages */}
        {status === "success" && (
          <div
            className="banner-anim"
            style={{
              padding: "14px 18px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              borderRadius: "14px",
              color: "#15803d",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ✅ Complaint submitted successfully!
          </div>
        )}
        {(status === "error" || errorMsg) ? (
          <div
            className="banner-anim"
            style={{
              padding: "14px 18px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "14px",
              color: "#b91c1c",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ❌ {errorMsg}
          </div>
        ) : null}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !qrVerified}
          className="btn-primary"
          style={{
            padding: "16px 24px",
            fontSize: "16px",
            marginTop: "8px",
            width: "100%",
            opacity: (isPending || !qrVerified) ? 0.5 : 1,
            transition: "opacity 0.2s ease",
            cursor: !qrVerified ? "not-allowed" : "pointer",
          }}
          id="submit-complaint-btn"
        >
          {isPending ? (
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
              Submitting…
            </>
          ) : (
            "📢 Submit Complaint"
          )}
        </button>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent;
            bottom: 0;
            color: transparent;
            cursor: pointer;
            height: auto;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: auto;
          }
          .complaint-pill {
            border: 2px solid #fed7aa;
            background: #ffffff;
            color: #78350f;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            transform: scale(1);
          }
          .complaint-pill:hover {
            background: #fff7ed;
            border-color: #fb923c;
            color: #c2410c;
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 4px 12px rgba(249,115,22,0.15);
          }
          .complaint-pill:active {
            transform: translateY(0) scale(0.98);
            transition-duration: 0.08s;
          }
          .meal-pill.active {
            border-color: #f97316;
            background: linear-gradient(135deg, #f97316, #ef4444);
            color: #ffffff;
            box-shadow: 0 6px 16px rgba(249,115,22,0.35);
            transform: scale(1.03);
          }
          .meal-pill.active:hover {
            box-shadow: 0 8px 20px rgba(249,115,22,0.45);
            transform: translateY(-1px) scale(1.04);
          }
          .category-pill.active {
            border-color: #f97316;
            background: rgba(249,115,22,0.12);
            color: #c2410c;
            box-shadow: 0 4px 12px rgba(249,115,22,0.2);
            transform: scale(1.04);
          }
          .category-pill.active:hover {
            box-shadow: 0 6px 16px rgba(249,115,22,0.3);
            transform: translateY(-1px) scale(1.05);
          }
        `}</style>
      </form>

      {/* QR Scanner modal (lazy-loaded, only mounts when opened) */}
      {showScanner && (
        <Suspense fallback={null}>
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        </Suspense>
      )}
    </>
  );
}
