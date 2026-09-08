"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

export default function ComplaintPhotoViewer({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Direct photo display — click to zoom */}
      <div
        onClick={() => setOpen(true)}
        style={{
          marginTop: 14,
          borderRadius: "14px",
          overflow: "hidden",
          border: "1.5px solid #fed7aa",
          boxShadow: "0 4px 18px rgba(249,115,22,0.15)",
          cursor: "zoom-in",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Complaint photo evidence"
          style={{
            width: "100%",
            maxHeight: "380px",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
        />
        {/* Zoom hint overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 20,
            pointerEvents: "none",
          }}
        >
          🔍 Click to zoom
        </div>
      </div>

      {open && (
        <ImageLightbox
          src={src}
          alt="Complaint photo evidence"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
