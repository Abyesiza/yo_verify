import Image from "next/image";

const features = [
  "Identity & document verification",
  "Phone & email verification",
  "Business registration checks",
  "Real-time status dashboard",
  "Simple REST API with API keys",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{
          background: "linear-gradient(160deg, rgba(232,53,144,0.07) 0%, rgba(24,195,244,0.05) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/yofriend i.svg" alt="Yo Verify" fill className="object-contain" />
          </div>
          <span className="text-lg font-bold tracking-wide text-[#ededed]">YO VERIFY</span>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-4xl font-bold text-[#ededed] leading-tight mb-4">
            Verify your users<br />
            <span style={{ color: "#e83590" }}>with confidence.</span>
          </h2>
          <p className="text-base text-[rgba(237,237,237,0.5)] mb-8 leading-relaxed">
            A powerful multi-tenant verification platform — plug in your API key and start verifying identities in minutes.
          </p>
          <ul className="flex flex-col gap-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                  style={{ background: "rgba(232,53,144,0.15)", color: "#e83590" }}
                >
                  ✓
                </span>
                <span className="text-sm text-[rgba(237,237,237,0.65)]">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[rgba(237,237,237,0.2)]">
          Powered by Yo Friend © 2026
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
