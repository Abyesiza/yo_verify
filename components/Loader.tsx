"use client";

import Image from "next/image";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Radial glow behind logo */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 340,
          height: 340,
          background:
            "radial-gradient(circle, rgba(232,53,144,0.18) 0%, rgba(24,195,244,0.10) 50%, transparent 80%)",
          filter: "blur(24px)",
        }}
      />

      {/* Logo + spinner ring combined */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 220,
          height: 220,
          animation: "floatLogo 3s ease-in-out infinite",
        }}
      >
        {/* Static track ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "3px solid rgba(255,255,255,0.08)" }}
        />

        {/* Spinning arc */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "3px solid transparent",
            borderTopColor: "#e83590",
            borderRightColor: "#18c3f4",
            animation: "spin 1.4s linear infinite",
          }}
        />

        {/* Logo centred inside the ring */}
        <Image
          src="/yofriend i.svg"
          alt="Yo Verfy Logo"
          width={150}
          height={150}
          priority
        />
      </div>

      {/* Powered by — pinned to bottom centre */}
      <div className="absolute bottom-8 flex items-center gap-2">
        <span
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: "rgba(237,237,237,0.35)" }}
        >
          Powered by
        </span>
        <Image
          src="/yofriend i.svg"
          alt="Yo Friend"
          width={20}
          height={20}
        />
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: "rgba(237,237,237,0.55)" }}
        >
          YO VERIFY
        </span>
      </div>

      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
