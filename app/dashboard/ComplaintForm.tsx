"use client";

import { useState, lazy, Suspense, useRef } from "react";
import { submitComplaint } from "@/app/actions/complaint";
import { submitCanteenRating } from "@/app/actions/canteenRating";
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

const CANTEEN_ITEMS = [
  "Samosa",
  "Vada Pav",
  "Poha",
  "Misal Pav",
  "Tea / Chai",
  "Filter Coffee",
  "Veg Sandwich",
  "Grilled Cheese Sandwich",
  "Veg Puff / Patties",
  "Masala Dosa",
  "Idli Sambhar",
  "Maggi",
  "Veg Fried Rice",
  "Veg Thali",
  "Paneer Roll",
];

export default function ComplaintForm({ mess }: { mess: string }) {
  // Venue toggle
  const [selectedVenue, setSelectedVenue] = useState(mess); // "My Mess" or "Main Canteen"
  const isCanteen = selectedVenue === "Main Canteen";

  // ── Complaint Form State (For Mess) ─────────────────────────
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [descLen, setDescLen] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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

  // ── Canteen Rating State ─────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingStatus, setRatingStatus] = useState<"idle" | "success" | "error">("idle");
  const [ratingError, setRatingError] = useState("");
  const [isRatingPending, setIsRatingPending] = useState(false);

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
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // ── Submit Mess Complaint ────────────────────────────────────
  const handleSubmitComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
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

  // ── Submit Canteen Rating ────────────────────────────────────
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      setRatingError("Please select a canteen item.");
      return;
    }
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingError("Please select a rating from 1 to 5.");
      return;
    }

    setIsRatingPending(true);
    setRatingError("");
    setRatingStatus("idle");

    try {
      const res = await submitCanteenRating({
        item: selectedItem,
        rating: selectedRating,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit rating.");
      }

      setRatingStatus("success");
      setSelectedItem("");
      setSelectedRating(0);
      setTimeout(() => setRatingStatus("idle"), 4000);
    } catch (err: any) {
      setRatingStatus("error");
      setRatingError(err.message || "Failed to submit rating. Please try again.");
    } finally {
      setIsRatingPending(false);
    }
  };

  return (
    <>
      {/* ── Dynamic Upper Heading ── */}
      <div style={{ marginBottom: "22px" }}>
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
          {isCanteen ? "⭐ Give Ratings" : "📢 New Complaint"}
        </h2>
        <p style={{ fontSize: "13px", color: "#78350f", margin: 0 }}>
          {isCanteen
            ? "Rate canteen items to help us improve food quality."
            : "Report an issue with your mess/canteen. We take all complaints seriously."}
        </p>
      </div>

      {/* ── Venue Selector (Always Available at Top) ── */}
      <div style={{ marginBottom: "22px" }}>
        <label className="label">{isCanteen ? "Venue" : "Complaining About"}</label>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: mess, icon: "🍽️", value: mess },
            { label: "Main Canteen", icon: "☕", value: "Main Canteen" },
          ].map(({ label, icon, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSelectedVenue(value);
                if (value === "Main Canteen") setShowScanner(false);
              }}
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
      </div>

      {/* ── CANTEEN RATING FORM ── */}
      {isCanteen ? (
        <form onSubmit={handleRatingSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Dropdown for Items */}
          <div>
            <label htmlFor="canteen-item-dropdown" className="label">
              Select Item
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="canteen-item-dropdown"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="input"
                style={{
                  width: "100%",
                  padding: "13px 40px 13px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "14px",
                  border: "1.5px solid #fed7aa",
                  background: "rgba(255,255,255,0.95)",
                  color: selectedItem ? "#431407" : "#9ca3af",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
              >
                <option value="" disabled>
                  -- Choose an item (e.g. Samosa, Chai...) --
                </option>
                {CANTEEN_ITEMS.map((item) => (
                  <option key={item} value={item} style={{ color: "#431407" }}>
                    {item}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  fontSize: "12px",
                  color: "#9a3412",
                }}
              >
                ▼
              </span>
            </div>
          </div>

          {/* Rating from 1 to 5 */}
          <div>
            <label className="label">Rating (1 to 5 Stars)</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "rgba(255,255,255,0.85)",
                padding: "14px 20px",
                borderRadius: "16px",
                border: "1.5px solid #fed7aa",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isHighlighted = (hoverRating || selectedRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "30px",
                        lineHeight: 1,
                        padding: 0,
                        transition: "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
                        transform: isHighlighted ? "scale(1.2)" : "scale(1)",
                        filter: isHighlighted
                          ? "drop-shadow(0 2px 8px rgba(245,158,11,0.5))"
                          : "grayscale(100%) opacity(0.3)",
                      }}
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      ⭐
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginLeft: "auto",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: selectedRating > 0 ? "#ea580c" : "#9ca3af",
                }}
              >
                {selectedRating === 5 && "🤩 5 - Excellent"}
                {selectedRating === 4 && "😊 4 - Good"}
                {selectedRating === 3 && "🙂 3 - Average"}
                {selectedRating === 2 && "😐 2 - Poor"}
                {selectedRating === 1 && "😞 1 - Terrible"}
                {selectedRating === 0 && "Select stars"}
              </div>
            </div>
          </div>

          {/* Feedback Banners */}
          {ratingStatus === "success" && (
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
              ✅ Rating submitted successfully! Thank you for your feedback.
            </div>
          )}

          {(ratingStatus === "error" || ratingError) && (
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
              ❌ {ratingError}
            </div>
          )}

          {/* Submit Rating Button */}
          <button
            type="submit"
            disabled={isRatingPending || !selectedItem || selectedRating === 0}
            className="btn-primary"
            style={{
              padding: "16px 24px",
              fontSize: "16px",
              marginTop: "4px",
              width: "100%",
              opacity: isRatingPending || !selectedItem || selectedRating === 0 ? 0.5 : 1,
              cursor: isRatingPending || !selectedItem || selectedRating === 0 ? "not-allowed" : "pointer",
              transition: "opacity 0.2s ease",
            }}
            id="submit-rating-btn"
          >
            {isRatingPending ? (
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
              "⭐ Submit Rating"
            )}
          </button>
        </form>
      ) : (
        /* ── MESS COMPLAINT FORM ── */
        <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <input type="hidden" name="mess" value={selectedVenue} />

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
              {descLen}/{DESC_MAX}
            </div>
          </div>

          {/* Camera Capture Section */}
          <div>
            <label className="label">
              Add Photo <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
            </label>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              style={{ display: "none" }}
              id="camera-file-input"
            />
            {capturedPreview ? (
              <div style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid #fed7aa",
                background: "#000",
                maxHeight: "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img
                  src={capturedPreview}
                  alt="Captured evidence"
                  style={{ width: "100%", maxHeight: "260px", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Remove photo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isCompressing}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "2px dashed #fed7aa",
                  background: "rgba(255,255,255,0.6)",
                  color: "#9a3412",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                {isCompressing ? "⏳ Processing photo…" : "📷 Take or Upload Photo"}
              </button>
            )}
          </div>

          {/* QR Authority Verification */}
          <div
            style={{
              padding: "16px 18px",
              borderRadius: "16px",
              border: qrVerified ? "1.5px solid #86efac" : "1.5px dashed #fed7aa",
              background: qrVerified ? "rgba(240, 253, 244, 0.85)" : "rgba(255, 247, 237, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "28px" }}>{qrVerified ? "✅" : "📱"}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: qrVerified ? "#15803d" : "#78350f" }}>
                  {qrVerified ? "Mess Authority Verified" : "Scan Authority QR Code"}
                </div>
                <div style={{ fontSize: "12px", color: qrVerified ? "#166534" : "#9a3412", opacity: 0.85 }}>
                  {qrVerified
                    ? "Your complaint is authenticated."
                    : "Coordinator QR required before submitting."}
                </div>
              </div>
            </div>

            {!qrVerified && (
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="btn-primary"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                📷 Scan QR
              </button>
            )}
          </div>

          {/* Feedback Banners */}
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

          {(status === "error" || errorMsg) && (
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
          )}

          {/* Submit Complaint Button */}
          <button
            type="submit"
            disabled={isPending || !qrVerified}
            className="btn-primary"
            style={{
              padding: "16px 24px",
              fontSize: "16px",
              marginTop: "8px",
              width: "100%",
              opacity: isPending || !qrVerified ? 0.5 : 1,
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
        </form>
      )}

      {/* QR Scanner modal (lazy-loaded, only mounts when opened and not canteen) */}
      {!isCanteen && showScanner && (
        <Suspense fallback={null}>
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        </Suspense>
      )}

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
    </>
  );
}
