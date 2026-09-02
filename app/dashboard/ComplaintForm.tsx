"use client";

import { useTransition, useRef, useState } from "react";
import { submitComplaint } from "@/app/actions/complaint";

const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const CATEGORIES = [
  "Food Quality",
  "Hygiene",
  "Quantity",
  "Service",
  "Other",
];

export default function ComplaintForm({ mess }: { mess: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus("idle");

    startTransition(async () => {
      try {
        await submitComplaint(formData);
        setStatus("success");
        formRef.current?.reset();
        setTimeout(() => setStatus("idle"), 4000);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Mess (read-only, auto-filled) */}
      <div>
        <label className="label">Your Mess</label>
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(249, 115, 22, 0.06)",
            border: "1px solid #fed7aa",
            borderRadius: "10px",
            color: "#92400e",
            fontWeight: 600,
            fontSize: "15px",
          }}
        >
          🍽️ {mess}
        </div>
      </div>

      {/* Meal */}
      <div>
        <label htmlFor="meal" className="label">Meal</label>
        <select id="meal" name="meal" required className="input" defaultValue="">
          <option value="" disabled>Select a meal</option>
          {MEALS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="label">Category</label>
        <select id="category" name="category" required className="input" defaultValue="">
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => (
             <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Incident Date */}
      <div>
        <label htmlFor="incidentDate" className="label">Date of Incident</label>
        <input
          id="incidentDate"
          name="incidentDate"
          type="date"
          required
          className="input"
        />
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
            borderRadius: "10px",
            color: "#15803d",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          ✅ Complaint submitted successfully!
        </div>
      )}
      {status === "error" && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "10px",
            color: "#b91c1c",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          ❌ {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
        style={{ padding: "14px 24px", fontSize: "15px" }}
        id="submit-complaint-btn"
      >
        {isPending ? (
          <>
            <span
              style={{
                width: 16,
                height: 16,
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
      `}</style>
    </form>
  );
}
