import React from "react";

export const FOOD_SVGS: Record<string, React.ReactNode> = {
  "Samosa": (
    <>
      <path d="M10 46 Q32 58 54 46 L48 53 Q32 61 16 53 Z" fill="#C87A28" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 8 C35 8 56 42 54 46 C40 53 24 53 10 46 C8 42 29 8 32 8 Z" fill="#F4A836" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 8 Q27 30 34 50" fill="none" stroke="#C87A28" strokeWidth="2" strokeLinecap="round" />
      <circle cx="23" cy="34" r="1.8" fill="#C87A28" />
      <circle cx="26" cy="41" r="1.2" fill="#C87A28" />
      <circle cx="41" cy="37" r="1.8" fill="#C87A28" />
      <circle cx="37" cy="27" r="1.5" fill="#C87A28" />
    </>
  ),

  "Vada Pav": (
    <>
      <path d="M12 42 L52 42 C54 49 48 54 32 54 C16 54 10 49 12 42 Z" fill="#F5C77E" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M13 41 Q32 45 51 41" fill="none" stroke="#D9381E" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="32" cy="35" rx="22" ry="9" fill="#D9822B" stroke="#5C3317" strokeWidth="2.5" />
      <path d="M44 36 Q56 32 60 39 Q53 43 44 38 Z" fill="#4C9A2A" stroke="#5C3317" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 30 C8 14 20 10 32 10 C44 10 56 14 54 30 C42 34 22 34 10 30 Z" fill="#F5C77E" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 18 Q32 13 44 18" fill="none" stroke="#FFF3DC" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),

  "Poha": (
    <>
      {/* Yellow Flattened Rice Heap */}
      <path d="M12 36 Q32 14 52 36 Z" fill="#FDE047" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Bowl Base */}
      <path d="M8 36 L56 36 C54 50 44 56 32 56 C20 56 10 50 8 36 Z" fill="#E2E8F0" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Lemon Wedge on Side */}
      <path d="M44 26 A6 6 0 0 1 54 32 Z" fill="#FEF08A" stroke="#4C9A2A" strokeWidth="2" />
      {/* Peanuts, Curry Leaves & Sev Garnish */}
      <circle cx="26" cy="28" r="2" fill="#9A3412" />
      <circle cx="37" cy="30" r="2" fill="#9A3412" />
      <ellipse cx="31" cy="25" rx="3" ry="1.5" fill="#15803D" />
      <path d="M22 33 L26 31 M33 33 L37 32 M28 30 L32 32" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),

  "Misal Pav": (
    <>
      {/* Twin Ladi Pav in Background */}
      <rect x="34" y="10" width="22" height="16" rx="5" fill="#F5C77E" stroke="#5C3317" strokeWidth="2.5" />
      <line x1="45" y1="10" x2="45" y2="26" stroke="#5C3317" strokeWidth="2" />
      {/* Spicy Red Tarri Bowl */}
      <path d="M6 34 L46 34 C44 49 36 55 26 55 C16 55 8 49 6 34 Z" fill="#FFFBEB" stroke="#5C3317" strokeWidth="2.5" />
      <ellipse cx="26" cy="34" rx="20" ry="6" fill="#DC2626" stroke="#5C3317" strokeWidth="2.5" />
      {/* Farsan / Sev & Chopped Onions */}
      <path d="M16 33 Q20 30 24 34 M26 32 Q31 36 35 32 M19 36 Q26 33 32 36" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="23" y="32" width="3" height="3" fill="#F8FAFC" />
      <rect x="30" y="34" width="3" height="3" fill="#4C9A2A" />
    </>
  ),

  "Tea / Chai": (
    <>
      <path d="M25 14 Q22 9 25 5" fill="none" stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 12 Q32 7 35 3" fill="none" stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 18 L48 18 L43 54 C42 57 38 58 32 58 C26 58 22 57 21 54 Z" fill="#E2F1F8" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M17.5 27 L46.5 27 L43 54 C42 56 38 57 32 57 C26 57 22 56 21 54 Z" fill="#C67D3B" />
      <ellipse cx="32" cy="27" rx="14.5" ry="3" fill="#E6A96E" stroke="#5C3317" strokeWidth="2" />
      <ellipse cx="32" cy="18" rx="16" ry="3.5" fill="#FFFFFF" stroke="#5C3317" strokeWidth="2.5" />
      <line x1="25" y1="32" x2="26.5" y2="52" stroke="#9E5B22" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="33" x2="32" y2="53" stroke="#9E5B22" strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="32" x2="37.5" y2="52" stroke="#9E5B22" strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  "Filter Coffee": (
    <>
      {/* Wide Bottom Dabarah (Saucer Bowl) */}
      <path d="M8 42 L56 42 C53 53 44 56 32 56 C20 56 11 53 8 42 Z" fill="#CBD5E1" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Stainless Steel Tumbler */}
      <path d="M19 20 L45 20 L42 44 L22 44 Z" fill="#E2E8F0" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Frothy Coffee Top */}
      <ellipse cx="32" cy="20" rx="13" ry="4" fill="#FFFBEB" stroke="#5C3317" strokeWidth="2.5" />
      <ellipse cx="32" cy="20" rx="8" ry="2" fill="#B45309" />
      {/* Steam */}
      <path d="M28 13 Q26 8 29 5 M36 13 Q34 8 37 5" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  "Veg Sandwich": (
    <>
      {/* Bottom Triangle Bread Slice */}
      <path d="M8 42 L56 42 L32 56 Z" fill="#FDE68A" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Green Chutney, Cucumber & Tomato Layers */}
      <path d="M10 38 L54 38" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 34 L52 34" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
      {/* Top Triangle Bread Slice */}
      <path d="M8 31 L56 31 L32 10 Z" fill="#FEF3C7" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),

  "Grilled Cheese Sandwich": (
    <>
      {/* Bottom Toasted Bread */}
      <path d="M8 42 L56 42 L32 56 Z" fill="#D97706" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Melted Golden Cheese Drip */}
      <path d="M10 35 L54 35 L48 41 L40 37 L32 44 L24 37 L16 41 Z" fill="#FACC15" stroke="#5C3317" strokeWidth="2" strokeLinejoin="round" />
      {/* Top Golden Toasted Bread */}
      <path d="M8 35 L56 35 L32 11 Z" fill="#F59E0B" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Grill Sear Marks */}
      <line x1="25" y1="21" x2="35" y2="31" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33" y1="19" x2="43" y2="29" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="25" x2="27" y2="33" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),

  "Veg Puff / Patties": (
    <>
      {/* Flaky Layered Pastry Base */}
      <path d="M8 38 L32 52 L56 38 L56 30 L32 44 L8 30 Z" fill="#D97706" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Spiced Aloomasala Peek */}
      <path d="M14 34 L32 44 L50 34" fill="none" stroke="#B45309" strokeWidth="3" />
      {/* Puffed Golden Top Pastry */}
      <path d="M8 30 L32 14 L56 30 L32 44 Z" fill="#F59E0B" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Baked Flaky Score Lines */}
      <line x1="24" y1="24" x2="32" y2="29" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="21" x2="40" y2="26" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  "Masala Dosa": (
    <>
      <ellipse cx="32" cy="40" rx="28" ry="16" fill="#4C9A2A" stroke="#5C3317" strokeWidth="2.5" />
      <circle cx="22" cy="29" r="5" fill="#D9531E" stroke="#5C3317" strokeWidth="2" />
      <circle cx="34" cy="27" r="4.5" fill="#F4F6F0" stroke="#5C3317" strokeWidth="2" />
      <path d="M6 38 Q32 24 58 36 C61 38 60 45 55 46 Q32 36 9 46 C4 45 3 40 6 38 Z" fill="#E59A38" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="56" cy="41" rx="3" ry="4.5" fill="#F7D038" stroke="#5C3317" strokeWidth="2" />
      <ellipse cx="7.5" cy="42" rx="2.5" ry="4" fill="#F7D038" stroke="#5C3317" strokeWidth="2" />
      <path d="M22 36 Q25 40 22 43" fill="none" stroke="#B86B19" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 35 Q38 39 35 42" fill="none" stroke="#B86B19" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 37 Q49 41 46 44" fill="none" stroke="#B86B19" strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  "Idli Sambhar": (
    <>
      {/* Banana Leaf Base */}
      <ellipse cx="32" cy="38" rx="27" ry="18" fill="#4C9A2A" stroke="#5C3317" strokeWidth="2.5" />
      {/* Sambhar Bowl with Garnish */}
      <circle cx="43" cy="31" r="9" fill="#EA580C" stroke="#5C3317" strokeWidth="2.5" />
      <circle cx="43" cy="31" r="2" fill="#15803D" />
      {/* Two Fluffy White Idlis */}
      <ellipse cx="21" cy="34" rx="10" ry="6.5" fill="#F8FAFC" stroke="#5C3317" strokeWidth="2.5" />
      <ellipse cx="26" cy="43" rx="10" ry="6.5" fill="#FFFFFF" stroke="#5C3317" strokeWidth="2.5" />
    </>
  ),

  "Maggi": (
    <>
      {/* Fork Lifting Noodles */}
      <path d="M42 8 L42 22 M38 10 L38 18 L46 18 L46 10" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M39 18 Q36 25 40 32 M43 18 Q46 25 42 32" fill="none" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
      {/* Wavy Yellow Maggi Mound */}
      <path d="M12 36 Q20 26 28 34 T44 32 T52 36" fill="#FDE047" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
      {/* Red Classic Maggi Bowl */}
      <path d="M8 36 L56 36 C54 50 44 56 32 56 C20 56 10 50 8 36 Z" fill="#DC2626" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Peas & Carrots */}
      <circle cx="22" cy="33" r="2" fill="#16A34A" />
      <circle cx="34" cy="34" r="2" fill="#EA580C" />
    </>
  ),

  "Veg Fried Rice": (
    <>
      {/* Dome of Rice */}
      <path d="M12 36 C12 20 52 20 52 36 Z" fill="#FEF9C3" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Wok / Serving Bowl */}
      <path d="M8 36 L56 36 C53 50 44 56 32 56 C20 56 11 50 8 36 Z" fill="#334155" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Diced Carrots, Green Peas & Spring Onion */}
      <rect x="23" y="27" width="3.5" height="3.5" rx="1" fill="#EA580C" />
      <rect x="36" y="29" width="3.5" height="3.5" rx="1" fill="#EA580C" />
      <circle cx="31" cy="25" r="2" fill="#16A34A" />
      <circle cx="27" cy="33" r="2" fill="#16A34A" />
      <circle cx="42" cy="33" r="2" fill="#15803D" />
    </>
  ),

  "Veg Thali": (
    <>
      {/* Large Stainless Steel Thali Platter */}
      <circle cx="32" cy="32" r="26" fill="#E2E8F0" stroke="#5C3317" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
      {/* 3 Katoris (Dal, Sabzi, Paneer) */}
      <circle cx="20" cy="22" r="5.5" fill="#F59E0B" stroke="#5C3317" strokeWidth="2" />
      <circle cx="32" cy="18" r="5.5" fill="#EA580C" stroke="#5C3317" strokeWidth="2" />
      <circle cx="44" cy="22" r="5.5" fill="#16A34A" stroke="#5C3317" strokeWidth="2" />
      {/* Steamed Rice Mound */}
      <ellipse cx="23" cy="40" rx="8" ry="6" fill="#FFFFFF" stroke="#5C3317" strokeWidth="2" />
      {/* Warm Roti / Chapati */}
      <circle cx="41" cy="39" r="7.5" fill="#D97706" stroke="#5C3317" strokeWidth="2" />
      <circle cx="39" cy="38" r="1.5" fill="#78350F" />
      <circle cx="43" cy="41" r="1.5" fill="#78350F" />
    </>
  ),

  "Paneer Roll": (
    <>
      {/* Golden Paratha Upper Half (Diagonal) */}
      <path d="M22 24 L38 10 C43 8 54 19 52 24 L36 38 Z" fill="#F59E0B" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Spiced Paneer & Veggie Filling at Top Opening */}
      <ellipse cx="45" cy="17" rx="8" ry="4.5" transform="rotate(45 45 17)" fill="#FEF08A" stroke="#5C3317" strokeWidth="2" />
      <rect x="43" y="14" width="4" height="4" fill="#EA580C" />
      <circle cx="47" cy="19" r="2" fill="#16A34A" />
      {/* White Foil / Butter Paper Wrapper at Bottom */}
      <path d="M12 42 L24 26 L38 40 L22 52 C16 54 10 48 12 42 Z" fill="#F8FAFC" stroke="#5C3317" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
};

export interface FoodIconProps {
  name: string;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function FoodIcon({
  name,
  size = "1.5em",
  className = "",
  style = {},
}: FoodIconProps) {
  const iconContent = FOOD_SVGS[name];

  if (!iconContent) {
    return (
      <span className={className} style={{ fontSize: size, ...style }}>
        🍽️
      </span>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={{
        verticalAlign: "middle",
        display: "inline-block",
        flexShrink: 0,
        ...style,
      }}
      aria-label={name}
      role="img"
    >
      {iconContent}
    </svg>
  );
}
