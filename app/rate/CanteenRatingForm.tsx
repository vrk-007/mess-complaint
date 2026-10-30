"use client";

import { useState } from "react";
import { submitCanteenRating } from "@/app/actions/canteenRating";
import CanteenItemSelector from "@/app/components/CanteenItemSelector";

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

interface OptionalStarPickerProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (val: number) => void;
}

function OptionalStarPicker({ label, emoji, value, onChange }: OptionalStarPickerProps) {
  const [hover, setHover] = useState(0);

  const LABELS: Record<number, string> = {
    5: "🤩 Excellent",
    4: "😊 Good",
    3: "🙂 Average",
    2: "😐 Poor",
    1: "😞 Terrible",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "11px 14px",
        borderRadius: "12px",
        border: "1.5px solid #fed7aa",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px 10px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#78350f" }}>{label}</span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#9a3412",
            background: "rgba(249,115,22,0.08)",
            padding: "1px 7px",
            borderRadius: 20,
            border: "1px solid rgba(249,115,22,0.15)",
          }}
        >
          Optional
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", gap: "clamp(2px, 1.5vw, 8px)" }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const lit = (hover || value) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(value === star ? 0 : star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                title={`${star} Star${star > 1 ? "s" : ""}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "clamp(20px, 5vw, 24px)",
                  lineHeight: 1,
                  padding: "2px",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s ease",
                  transform: lit ? "scale(1.18)" : "scale(1)",
                  filter: lit
                    ? "drop-shadow(0 2px 4px rgba(245,158,11,0.45))"
                    : "grayscale(100%) opacity(0.28)",
                }}
              >
                ⭐
              </button>
            );
          })}
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: value > 0 ? "#ea580c" : "#9ca3af",
            whiteSpace: "nowrap",
            minWidth: 75,
          }}
        >
          {value > 0 ? LABELS[value] : "Tap to rate"}
        </span>
      </div>
    </div>
  );
}

export default function CanteenRatingForm() {
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingRemark, setRatingRemark] = useState("");

  // Optional sub-ratings
  const [quantityRating, setQuantityRating] = useState(0);
  const [hygieneRating, setHygieneRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);

  const [ratingStatus, setRatingStatus] = useState<"idle" | "success" | "error">("idle");
  const [ratingError, setRatingError] = useState("");
  const [isRatingPending, setIsRatingPending] = useState(false);

  const handleRatingSubmit = async () => {
    if (!selectedItem) {
      setRatingError("Please select a canteen item.");
      return;
    }
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingError("Please select a rating from 1 to 5 stars.");
      return;
    }
    if (!ratingRemark.trim()) {
      setRatingError("Please provide a remark explaining your rating.");
      return;
    }

    setIsRatingPending(true);
    setRatingError("");
    setRatingStatus("idle");

    try {
      const res = await submitCanteenRating({
        item: selectedItem,
        rating: selectedRating,
        comment: ratingRemark.trim() || undefined,
        quantityRating: quantityRating > 0 ? quantityRating : undefined,
        hygieneRating: hygieneRating > 0 ? hygieneRating : undefined,
        staffRating: staffRating > 0 ? staffRating : undefined,
        cleanlinessRating: cleanlinessRating > 0 ? cleanlinessRating : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit rating.");
      }

      setRatingStatus("success");
      setSelectedItem("");
      setSelectedRating(0);
      setRatingRemark("");
      setQuantityRating(0);
      setHygieneRating(0);
      setStaffRating(0);
      setCleanlinessRating(0);
      setTimeout(() => setRatingStatus("idle"), 4000);
    } catch (err: any) {
      setRatingStatus("error");
      setRatingError(err.message || "Failed to submit rating. Please try again.");
    } finally {
      setIsRatingPending(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 237, 213, 0.8))",
        border: "1.5px solid #fed7aa",
        borderRadius: "18px",
        padding: "18px clamp(12px, 4vw, 20px)",
        boxShadow: "0 4px 16px rgba(249, 115, 22, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: "20px" }}>⭐</span>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#431407", margin: 0 }}>
            Give Ratings
          </h3>
        </div>
        <p style={{ fontSize: "13px", color: "#9a3412", margin: 0, lineHeight: 1.4 }}>
          Rate canteen items to help us improve food quality.
        </p>
      </div>

      {/* Canteen Item Selector with Food SVGs */}
      <div>
        <label className="label" style={{ fontSize: "12px", marginBottom: 6 }}>
          Select Item
        </label>
        <CanteenItemSelector
          items={CANTEEN_ITEMS}
          value={selectedItem}
          onChange={(item) => {
            setSelectedItem(item);
            if (ratingError) setRatingError("");
          }}
        />
      </div>

      {/* 1 to 5 Star Rating */}
      <div>
        <label className="label" style={{ fontSize: "12px", marginBottom: 6 }}>
          Overall Rating (1 to 5 Stars)
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px 8px",
            background: "#ffffff",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1.5px solid #fed7aa",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(4px, 2vw, 10px)",
            }}
          >
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
                    fontSize: "clamp(24px, 7vw, 28px)",
                    lineHeight: 1,
                    padding: "4px 2px",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                    transition: "transform 0.15s ease",
                    transform: isHighlighted ? "scale(1.2)" : "scale(1)",
                    filter: isHighlighted
                      ? "drop-shadow(0 2px 6px rgba(245,158,11,0.5))"
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
              fontWeight: 700,
              fontSize: "12px",
              color: selectedRating > 0 ? "#ea580c" : "#9ca3af",
              whiteSpace: "nowrap",
              marginLeft: "auto",
            }}
          >
            {selectedRating === 5 && "🤩 5 - Excellent"}
            {selectedRating === 4 && "😊 4 - Good"}
            {selectedRating === 3 && "🙂 3 - Average"}
            {selectedRating === 2 && "😐 2 - Poor"}
            {selectedRating === 1 && "😞 1 - Terrible"}
            {selectedRating === 0 && "Tap stars to rate"}
          </div>
        </div>
      </div>

      {/* Remark Input (Mandatory) */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <label htmlFor="rate-remark" className="label" style={{ fontSize: "12px", margin: 0 }}>
            Remark <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
          </label>
          <span style={{ fontSize: "11px", color: ratingRemark.length > 180 ? "#ef4444" : "#9a3412", opacity: 0.7 }}>
            {ratingRemark.length}/200
          </span>
        </div>
        <input
          id="rate-remark"
          type="text"
          required
          maxLength={200}
          value={ratingRemark}
          onChange={(e) => setRatingRemark(e.target.value)}
          placeholder="(e.g. Crispy and hot, or too oily)..."
          className="input"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "15px",
            borderRadius: "12px",
            border: "1.5px solid #fed7aa",
            background: "#ffffff",
            color: "#431407",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Optional Ratings Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(254,215,170,0.7)" }} />
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", opacity: 0.8, whiteSpace: "nowrap" }}>
          ✨ Optional: Rate more aspects
        </span>
        <div style={{ flex: 1, height: "1px", background: "rgba(254,215,170,0.7)" }} />
      </div>

      {/* Item-specific optional ratings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <OptionalStarPicker
          label="Quantity of Food Item"
          emoji="🍽️"
          value={quantityRating}
          onChange={setQuantityRating}
        />
        <OptionalStarPicker
          label="Hygiene of Food Item"
          emoji="🧼"
          value={hygieneRating}
          onChange={setHygieneRating}
        />
      </div>

      {/* Canteen-wide optional ratings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <OptionalStarPicker
          label="Behaviour of Staff"
          emoji="🤝"
          value={staffRating}
          onChange={setStaffRating}
        />
        <OptionalStarPicker
          label="Cleanliness of Canteen"
          emoji="✨"
          value={cleanlinessRating}
          onChange={setCleanlinessRating}
        />
      </div>

      {/* Feedback Banners */}
      {ratingStatus === "success" && (
        <div
          className="banner-anim"
          style={{
            padding: "10px 14px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.35)",
            borderRadius: "10px",
            color: "#15803d",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          ✅ Rating submitted successfully! Thank you for your feedback.
        </div>
      )}

      {(ratingStatus === "error" || ratingError) && (
        <div
          className="banner-anim"
          style={{
            padding: "10px 14px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "10px",
            color: "#b91c1c",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          ❌ {ratingError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        id="submit-canteen-rating"
        onClick={handleRatingSubmit}
        disabled={isRatingPending || !selectedItem || selectedRating === 0 || !ratingRemark.trim()}
        className="btn-primary"
        style={{
          padding: "14px 20px",
          minHeight: "48px",
          fontSize: "15px",
          fontWeight: 700,
          width: "100%",
          opacity: isRatingPending || !selectedItem || selectedRating === 0 || !ratingRemark.trim() ? 0.5 : 1,
          cursor: isRatingPending || !selectedItem || selectedRating === 0 || !ratingRemark.trim() ? "not-allowed" : "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {isRatingPending ? "Submitting Rating…" : "⭐ Submit Rating"}
      </button>
    </div>
  );
}
