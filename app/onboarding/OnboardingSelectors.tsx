"use client";

import { useState, useRef, useEffect } from "react";

const HOSTELS = [
  "Aryabhatta",
  "S.Ramanujan",
  "M.S.Swaminathan",
  "V.G.Bhide",
  "A.P.J. Abdul Kalam",
  "C.V.Raman",
  "Homi.J.Bhabha",
  "J.C.Bose",
  "Meghnad Saha",
  "Vikram Sarabhai",
  "Kalpana Chawla",
  "Dr. Anandi Gopal Joshi",
];

const MESSES = ["Swadanand Mess", "Aaswad Mess", "Ruchira Mess"];

// ── Single reusable custom dropdown ────────────────────────────────────────
function CustomDropdown({
  name,
  options,
  placeholder,
  id,
}: {
  name: string;
  options: string[];
  placeholder: string;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <>
      <style>{`
        @keyframes ob-dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .ob-dropdown-list {
          animation: ob-dropdown-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .ob-option {
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #431407;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ob-option:hover {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          color: #9a3412;
          padding-left: 20px;
        }
        .ob-option.selected {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          color: #9a3412;
          font-weight: 700;
        }
        .ob-trigger {
          width: 100%;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          color: #431407;
          font-size: 15px;
          font-family: "Inter", sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          text-align: left;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          outline: none;
        }
        .ob-trigger:hover {
          border-color: #fdba74;
        }
        .ob-trigger.active, .ob-trigger:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
          background: #fffbf7;
        }
        .ob-trigger .placeholder {
          color: #9a3412;
          opacity: 0.6;
        }
        .ob-chevron {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          color: #9a3412;
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .ob-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      <div ref={ref} style={{ position: "relative" }}>
        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={selected} required />

        {/* Trigger button */}
        <button
          id={id}
          type="button"
          className={`ob-trigger${open ? " active" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected ? (
            <span style={{ fontWeight: 600 }}>{selected}</span>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
          <svg
            className={`ob-chevron${open ? " open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Options list */}
        {open && (
          <div
            className="ob-dropdown-list"
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid #fed7aa",
              borderRadius: 14,
              boxShadow: "0 12px 40px rgba(120,53,15,0.14)",
              zIndex: 100,
              padding: "6px",
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                role="option"
                aria-selected={selected === opt}
                className={`ob-option${selected === opt ? " selected" : ""}`}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
              >
                {selected === opt && (
                  <span style={{ color: "#f97316", fontSize: 13, flexShrink: 0 }}>✓</span>
                )}
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Exported composite component used by the server page ──────────────────
export default function OnboardingSelectors() {
  return (
    <>
      {/* Hostel */}
      <div>
        <label htmlFor="hostel" className="label">
          Hostel
        </label>
        <CustomDropdown
          id="hostel"
          name="hostel"
          options={HOSTELS}
          placeholder="Select your hostel"
        />
      </div>

      {/* Mess */}
      <div>
        <label htmlFor="mess" className="label">
          Mess
        </label>
        <CustomDropdown
          id="mess"
          name="mess"
          options={MESSES}
          placeholder="Select your mess"
        />
      </div>
    </>
  );
}
