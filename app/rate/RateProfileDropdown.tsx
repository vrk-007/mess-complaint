"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function RateProfileDropdown({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const email = user.email || "";
  // Name extracted from mail (username before @)
  const nameFromEmail = email ? email.split("@")[0] : (user.name || "User");
  const avatarLetter = nameFromEmail ? nameFromEmail.charAt(0).toUpperCase() : "👤";

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
          color: "white"
        }}
        aria-label="Profile menu"
      >
        {avatarLetter}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 glass shadow-lg rounded-xl overflow-hidden z-50 border border-orange-200"
          style={{ padding: "16px" }}
        >
          <div className="mb-4 pb-4 border-b border-orange-100">
            <p className="font-bold text-orange-900 break-all">{nameFromEmail}</p>
            <p className="text-xs text-orange-700 break-all">{email}</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full btn-primary text-center"
            style={{ padding: "10px", fontSize: "14px" }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
