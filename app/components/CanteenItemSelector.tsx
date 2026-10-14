"use client";

import React, { useState, useRef, useEffect } from "react";
import FoodIcon from "./FoodIcon";

interface CanteenItemSelectorProps {
  items: string[];
  value: string;
  onChange: (item: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CanteenItemSelector({
  items,
  value,
  onChange,
  placeholder = "Choose an item (e.g. Samosa, Chai...)",
  disabled = false,
}: CanteenItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", userSelect: "none" }}
    >
      <style>{`
        @keyframes canteenDropdownIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .canteen-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          min-height: 48px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          background: transparent;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .canteen-item-row:hover, .canteen-item-row:active {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          transform: translateX(2px);
        }
        .canteen-item-row.selected {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          border: 1px solid #fdba74;
        }
        .canteen-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .canteen-scroll::-webkit-scrollbar-track {
          background: #fdfbf7;
          border-radius: 8px;
        }
        .canteen-scroll::-webkit-scrollbar-thumb {
          background: #fed7aa;
          border-radius: 8px;
        }
        .canteen-scroll::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: "100%",
          padding: "10px 14px",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: "#ffffff",
          border: isOpen ? "1.5px solid #f97316" : "1.5px solid #fed7aa",
          borderRadius: "12px",
          boxShadow: isOpen
            ? "0 0 0 3px rgba(249, 115, 22, 0.18), 0 2px 6px rgba(249, 115, 22, 0.08)"
            : "0 2px 6px rgba(249, 115, 22, 0.05)",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "all 0.2s ease",
          textAlign: "left",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1, overflow: "hidden" }}>
          {value ? (
            <>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                  border: "1px solid #fed7aa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 1px 4px rgba(249, 115, 22, 0.1)",
                }}
              >
                <FoodIcon name={value} size="26px" />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#431407",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {value}
              </span>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#fef3c7",
                  border: "1px dashed #fcd34d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "17px",
                }}
              >
                🍽️
              </div>
              <span
                style={{
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {placeholder}
              </span>
            </>
          )}
        </div>

        {/* Chevron Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            color: "#9a3412",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(18px)",
            border: "1.5px solid #fed7aa",
            borderRadius: "14px",
            boxShadow:
              "0 12px 36px rgba(120, 53, 15, 0.16), 0 4px 12px rgba(0, 0, 0, 0.05)",
            zIndex: 100,
            padding: "8px",
            animation: "canteenDropdownIn 0.18s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          {/* Search Bar inside Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#fff7ed",
              borderRadius: "10px",
              border: "1px solid #ffedd5",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", opacity: 0.7 }}>🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter items..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "16px",
                fontWeight: 600,
                color: "#431407",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "12px",
                  color: "#9a3412",
                  cursor: "pointer",
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* List of items */}
          <div
            className="canteen-scroll"
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {filteredItems.length === 0 ? (
              <div
                style={{
                  padding: "16px 12px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#9a3412",
                  fontStyle: "italic",
                }}
              >
                No items match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = value === item;
                return (
                  <div
                    key={item}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    className={`canteen-item-row ${isSelected ? "selected" : ""}`}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isSelected
                          ? "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)"
                          : "#fff7ed",
                        border: isSelected ? "1px solid #f97316" : "1px solid #ffedd5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 1px 3px rgba(249, 115, 22, 0.08)",
                      }}
                    >
                      <FoodIcon name={item} size="26px" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? "#9a3412" : "#431407",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item}
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          color: "#f97316",
                          fontWeight: 800,
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
