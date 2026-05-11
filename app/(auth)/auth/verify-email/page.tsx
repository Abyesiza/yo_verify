"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const verified = params.get("verified");
    const error = params.get("error");
    const token = params.get("access_token");

    if (verified === "true" && token) {
      localStorage.setItem("yv_access_token", token);
      refetch().then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      });
    } else if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
    } else {
      setStatus("error");
      setMessage("Invalid or expired verification link.");
    }
  }, [refetch]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <GlassCard className="text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <Image src="/yofriend i.svg" alt="Yo Verify" width={56} height={56} />
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner size="lg" />
            <p className="text-sm text-[rgba(237,237,237,0.5)]">Verifying your email…</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              ✓
            </div>
            <h2 className="text-xl font-bold text-[#ededed] mb-2">Email Verified!</h2>
            <p className="text-sm text-[rgba(237,237,237,0.5)] mb-6">{message}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              ✕
            </div>
            <h2 className="text-xl font-bold text-[#ededed] mb-2">Verification Failed</h2>
            <p className="text-sm text-[rgba(237,237,237,0.5)] mb-6">{message}</p>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="secondary"
              className="w-full"
            >
              Back to login
            </Button>
          </>
        )}
      </GlassCard>
    </div>
  );
}
