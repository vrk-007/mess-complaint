"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ProfileDropdown({
  user,
  isAdmin = false,
}: {
  user: { name?: string | null; email?: string | null; rollNo?: string | null; hostel?: string | null; mess?: string | null };
  isAdmin?: boolean;
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
      >
        {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 glass shadow-lg rounded-xl overflow-hidden z-50 border border-orange-200"
          style={{ padding: "16px" }}
        >
          <div className="mb-4 pb-4 border-b border-orange-100">
            <p className="font-bold text-orange-900">{user.name || "User"}</p>
            <p className="text-xs text-orange-700">{user.email}</p>
          </div>
          
          {!isAdmin && (
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-700 font-semibold">Roll No:</span>
                <span className="text-orange-900 font-bold">{user.rollNo}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-700 font-semibold">Hostel:</span>
                <span className="text-orange-900 font-bold">{user.hostel}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-700 font-semibold">Mess:</span>
                <span className="text-orange-900 font-bold">{user.mess}</span>
              </div>
            </div>
          )}

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
