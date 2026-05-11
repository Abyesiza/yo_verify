"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-2xl p-6 animate-fade-in shadow-2xl`}
        style={{
          background: "#0e0e17",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#ededed]">{title}</h2>
            {subtitle && (
              <p className="text-sm mt-0.5 text-[rgba(237,237,237,0.5)]">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-[rgba(237,237,237,0.35)] hover:text-[#ededed] transition-colors
              w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}
