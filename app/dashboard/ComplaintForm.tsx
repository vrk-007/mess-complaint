"use client";

import { useTransition, useRef, useState } from "react";
import { submitComplaint } from "@/app/actions/complaint";

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const MEAL_ICONS: Record<string, string> = { Breakfast: "🌅", Lunch: "☀️", Snacks: "🍪", Dinner: "🌙" };

const CATEGORIES = [
  "Food Quality",
  "Hygiene",
  "Quantity",
  "Service",
  "Other",
];
const CAT_ICONS: Record<string, string> = {
  "Food Quality": "🍲", "Hygiene": "🧼", "Quantity": "⚖️", "Service": "🛎️", "Other": "📌"
};

export default function ComplaintForm({ mess }: { mess: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Custom states for aesthetic selections
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Manual validation since hidden inputs don't trigger native browser popups well
    if (!selectedMeal) return setErrorMsg("Please select a meal.");
    if (!selectedCategory) return setErrorMsg("Please select a category.");
    
    setStatus("idle");
    setErrorMsg("");

    startTransition(async () => {
      try {
        await submitComplaint(formData);
        setStatus("success");
        formRef.current?.reset();
        setSelectedMeal("");
        setSelectedCategory("");
        setTimeout(() => setStatus("idle"), 4000);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
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
              style={{
                flex: "1 1 calc(50% - 10px)",
                padding: "12px 16px",
                borderRadius: "14px",
                border: "2px solid",
                borderColor: selectedMeal === m ? "#f97316" : "#fed7aa",
                background: selectedMeal === m ? "linear-gradient(135deg, #f97316, #ef4444)" : "#ffffff",
                color: selectedMeal === m ? "#ffffff" : "#78350f",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: selectedMeal === m ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
              }}
            >
              <span style={{ fontSize: "16px" }}>{MEAL_ICONS[m]}</span> {m}
            </button>
          ))}
        </div>
        <input type="hidden" name="meal" value={selectedMeal} required />
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
              style={{
                flex: "1 1 auto",
                padding: "10px 16px",
                borderRadius: "20px",
                border: "2px solid",
                borderColor: selectedCategory === c ? "#f97316" : "#fed7aa",
                background: selectedCategory === c ? "rgba(249,115,22,0.1)" : "#ffffff",
                color: selectedCategory === c ? "#c2410c" : "#78350f",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{CAT_ICONS[c]}</span> {c}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={selectedCategory} required />
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
          rows={4}
          placeholder="Describe your complaint in detail…"
          className="input"
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "14px",
            color: "#15803d",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          ✅ Complaint submitted successfully!
        </div>
      )}
      {status === "error" || errorMsg ? (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "14px",
            color: "#b91c1c",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          ❌ {errorMsg}
        </div>
      ) : null}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
        style={{ padding: "16px 24px", fontSize: "16px", marginTop: "8px", width: "100%" }}
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
        /* Custom calendar icon styling for webkit */
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
      `}</style>
    </form>
  );
}
