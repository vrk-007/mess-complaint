"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import FoodIcon from "./FoodIcon";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set of letters that actually have items in the menu
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    items.forEach((item) => {
      const firstChar = item.trim().charAt(0).toUpperCase();
      if (firstChar >= "A" && firstChar <= "Z") {
        letters.add(firstChar);
      }
    });
    return letters;
  }, [items]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setSelectedLetter(null);
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
        setSelectedLetter(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = searchQuery.trim()
      ? item.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : true;
    const matchesLetter = selectedLetter
      ? item.trim().toUpperCase().startsWith(selectedLetter)
      : true;
    return matchesSearch && matchesLetter;
  });

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
    setSearchQuery("");
    setSelectedLetter(null);
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
        .canteen-grid-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          text-align: center;
          gap: 4px;
          padding: 8px 4px 6px;
          min-height: 66px;
          border-radius: 12px;
          border: 1.5px solid #fed7aa;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }
        .canteen-grid-tile:hover, .canteen-grid-tile:active {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border-color: #f97316;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.12);
        }
        .canteen-grid-tile.selected {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          border-color: #f97316;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
        }
        .canteen-scroll::-webkit-scrollbar {
          width: 5px;
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
        .canteen-az-bar::-webkit-scrollbar {
          display: none;
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

          {/* Sliding A-Z Letter Filter */}
          <div
            className="canteen-az-bar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              overflowX: "auto",
              paddingBottom: "8px",
              marginBottom: "8px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* "All" button */}
            <button
              type="button"
              onClick={() => setSelectedLetter(null)}
              style={{
                flexShrink: 0,
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "14px",
                border: "1px solid",
                borderColor: selectedLetter === null ? "#f97316" : "#fed7aa",
                background:
                  selectedLetter === null
                    ? "linear-gradient(135deg, #f97316, #ef4444)"
                    : "#fff7ed",
                color: selectedLetter === null ? "#ffffff" : "#78350f",
                cursor: "pointer",
                boxShadow:
                  selectedLetter === null
                    ? "0 2px 6px rgba(249, 115, 22, 0.3)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              All
            </button>

            {/* A-Z letter buttons */}
            {ALPHABET.map((letter) => {
              const hasItems = availableLetters.has(letter);
              const isSelected = selectedLetter === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetter(isSelected ? null : letter);
                  }}
                  style={{
                    flexShrink: 0,
                    width: "27px",
                    height: "27px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: isSelected ? 800 : hasItems ? 700 : 500,
                    borderRadius: "50%",
                    border: isSelected
                      ? "1.5px solid #f97316"
                      : hasItems
                      ? "1px solid #fed7aa"
                      : "1px solid transparent",
                    background: isSelected
                      ? "linear-gradient(135deg, #f97316, #ef4444)"
                      : hasItems
                      ? "#ffffff"
                      : "rgba(255, 247, 237, 0.4)",
                    color: isSelected
                      ? "#ffffff"
                      : hasItems
                      ? "#431407"
                      : "#d1d5db",
                    cursor: hasItems ? "pointer" : "default",
                    opacity: hasItems ? 1 : 0.45,
                    boxShadow: isSelected
                      ? "0 2px 6px rgba(249, 115, 22, 0.3)"
                      : hasItems
                      ? "0 1px 3px rgba(0,0,0,0.04)"
                      : "none",
                    transition: "all 0.15s ease",
                  }}
                  title={
                    hasItems
                      ? `Show items starting with ${letter}`
                      : `No items starting with ${letter}`
                  }
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* 3-Column Grid of items */}
          <div
            className="canteen-scroll"
            style={{
              maxHeight: "380px",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "6px",
              padding: "2px",
            }}
          >
            {filteredItems.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "24px 12px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#9a3412",
                  fontStyle: "italic",
                }}
              >
                No items match{searchQuery ? ` "${searchQuery}"` : ""}{selectedLetter ? ` starting with "${selectedLetter}"` : ""}
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
                    className={`canteen-grid-tile ${isSelected ? "selected" : ""}`}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 5,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#f97316",
                          color: "#ffffff",
                          fontSize: "9px",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 1px 3px rgba(249, 115, 22, 0.4)",
                        }}
                      >
                        ✓
                      </div>
                    )}

                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
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
                      <FoodIcon name={item} size="22px" />
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: isSelected ? 800 : 700,
                        color: isSelected ? "#9a3412" : "#431407",
                        lineHeight: 1.15,
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        padding: "0 2px",
                      }}
                    >
                      {item}
                    </span>
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
