"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const baseInputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ededed",
  outline: "none",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[rgba(237,237,237,0.7)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl px-4 py-3 text-sm placeholder:text-[rgba(237,237,237,0.25)]
          transition-all duration-150 focus:shadow-[0_0_0_2px_rgba(232,53,144,0.3)] ${className}`}
        style={{
          ...baseInputStyle,
          borderColor: error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,53,144,0.5)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "rgba(239,68,68,0.5)"
            : "rgba(255,255,255,0.1)";
          props.onBlur?.(e);
        }}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[rgba(237,237,237,0.35)]">{hint}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[rgba(237,237,237,0.7)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full rounded-xl px-4 py-3 text-sm resize-none placeholder:text-[rgba(237,237,237,0.25)]
          transition-all duration-150 ${className}`}
        style={{
          ...baseInputStyle,
          borderColor: error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,53,144,0.5)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "rgba(239,68,68,0.5)"
            : "rgba(255,255,255,0.1)";
          props.onBlur?.(e);
        }}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[rgba(237,237,237,0.35)]">{hint}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = "", children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[rgba(237,237,237,0.7)]">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl px-4 py-3 text-sm transition-all duration-150 ${className}`}
        style={{
          ...baseInputStyle,
          borderColor: error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(237,237,237,0.4)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "36px",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default Input;
