"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary"
      style={{
        width: "100%",
        padding: "16px 24px",
        fontSize: "16px",
        marginTop: "8px",
        opacity: pending ? 0.7 : 1,
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      id="complete-profile-btn"
    >
      {pending ? (
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
              flexShrink: 0,
            }}
          />
          Saving Profile…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        "✅ Complete Profile"
      )}
    </button>
  );
}
