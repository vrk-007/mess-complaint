"use client";

import { useState, lazy, Suspense, useRef } from "react";
import { submitComplaint } from "@/app/actions/complaint";
import { compressImage } from "@/lib/imageCompression";
import { supabase } from "@/lib/supabaseClient";

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
  const [selectedVenue, setSelectedVenue] = useState(mess); // "My Mess" or "Main Canteen"

  // QR verification state
  const [qrToken, setQrToken] = useState("");
  const [qrVerified, setQrVerified] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Image capture state
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const todayStr = new Date().toISOString().split("T")[0];

  const handleScan = (token: string) => {
    setQrToken(token);
    setQrVerified(true);
    setShowScanner(false);
  };

  // Handle native camera capture
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setCapturedFile(compressed);

      // Generate preview URL
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(compressed);
    } catch {
      setErrorMsg("Failed to process image. Please try again.");
    } finally {
      setIsCompressing(false);
      // Reset input so the same file can be re-selected after retake
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedMeal) return setErrorMsg("Please select a meal.");
    if (!selectedCategory) return setErrorMsg("Please select a category.");
    if (!qrVerified || !qrToken) return setErrorMsg("Please scan the Mess Authority QR code first.");

    const formData = new FormData(e.currentTarget);
    formData.set("qrToken", qrToken);
    const form = e.currentTarget;

    const incidentDate = (formData.get("incidentDate") as string)?.trim();
    const todayStr = new Date().toISOString().split("T")[0];
    if (incidentDate && incidentDate > todayStr) {
      return setErrorMsg("Incident date cannot be in the future.");
    }

    setIsPending(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      // Upload photo to Supabase Storage if one was captured
      if (capturedFile) {
        if (!supabase) {
          throw new Error("Storage service is not configured. Please contact the administrator.");
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("complaint-images")
          .upload(fileName, capturedFile, { contentType: capturedFile.type, upsert: false });

        if (uploadError) throw new Error("Photo upload failed. Please try again.");

        const { data: publicUrlData } = supabase.storage
          .from("complaint-images")
          .getPublicUrl(fileName);

        formData.set("imageUrl", publicUrlData.publicUrl);
      }

      const res = await submitComplaint(formData);
      if (!res.success) {
        throw new Error(res.error || "Failed to submit complaint.");
      }

      setStatus("success");
      form.reset();
      setSelectedMeal("");
      setSelectedCategory("");
      setSelectedVenue(mess);
      setDescLen(0);
      setQrToken("");
      setQrVerified(false);
      setCapturedPreview(null);
      setCapturedFile(null);
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
        {/* Venue Selector */}
        <div>
          <label className="label">Complaining About</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: mess, icon: "🍽️", value: mess },
              { label: "Main Canteen", icon: "☕", value: "Main Canteen" },
            ].map(({ label, icon, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedVenue(value)}
                style={{
                  flex: 1,
                  padding: "13px 16px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  border: selectedVenue === value
                    ? "2px solid #f97316"
                    : "1.5px solid #fed7aa",
                  background: selectedVenue === value
                    ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                    : "rgba(255,255,255,0.7)",
                  color: selectedVenue === value ? "#9a3412" : "#78350f",
                  boxShadow: selectedVenue === value
                    ? "0 4px 14px rgba(249,115,22,0.18), inset 0 2px 4px rgba(255,255,255,0.5)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                  transform: selectedVenue === value ? "translateY(-1px)" : "none",
                  transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span style={{ fontSize: "18px" }}>{icon}</span>
                {label}
                {selectedVenue === value && (
                  <span style={{ marginLeft: 4, fontSize: "12px", color: "#f97316" }}>✓</span>
                )}
              </button>
            ))}
          </div>
          <input type="hidden" name="mess" value={selectedVenue} />
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
              max={todayStr}
              defaultValue={todayStr}
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

        {/* ── Photo Evidence (Optional) ─────────────────────────────────────── */}
        <div>
          <label className="label">📸 Photo Evidence <span style={{ fontWeight: 400, color: "#a8a29e", fontSize: "13px" }}>(Optional)</span></label>

          {/* Hidden native camera input — capture="environment" forces rear camera */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleCameraCapture}
            id="camera-capture-input"
          />

          {capturedPreview ? (
            /* Photo Preview Card */
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid #fb923c",
                boxShadow: "0 4px 20px rgba(249,115,22,0.2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedPreview}
                alt="Captured photo evidence"
                style={{
                  width: "100%",
                  maxHeight: "280px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Overlay actions */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                  padding: "20px 16px 14px",
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  🔄 Retake
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: "rgba(239,68,68,0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ) : (
            /* Camera Trigger Button */
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isCompressing}
              style={{
                width: "100%",
                padding: "20px 16px",
                borderRadius: 14,
                border: "2px dashed #fed7aa",
                background: "#fff7ed",
                color: "#9a3412",
                fontWeight: 700,
                fontSize: "15px",
                cursor: isCompressing ? "wait" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
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
              {isCompressing ? (
                <>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      border: "2.5px solid #fed7aa",
                      borderTopColor: "#f97316",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "13px" }}>Processing photo…</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: "32px" }}>📷</span>
                  <span>Take Photo</span>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#c2410c", opacity: 0.7 }}>
                    Captures directly with your rear camera
                  </span>
                </>
              )}
            </button>
          )}
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
