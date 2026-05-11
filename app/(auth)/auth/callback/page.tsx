"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

type Status = "loading" | "success" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const error = params.get("error");
    const provider = params.get("provider") ?? "oauth";

    if (accessToken) {
      localStorage.setItem("yv_access_token", accessToken);
      refetch().then(() => {
        setStatus("success");
        setMessage(`Signed in with ${provider === "google" ? "Google" : "OAuth"} successfully!`);
        // Short delay to show success state, then navigate
        setTimeout(() => router.replace("/dashboard"), 1200);
      }).catch(() => {
        setStatus("error");
        setMessage("Authentication succeeded but we couldn't load your profile. Please try again.");
      });
    } else if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
    } else {
      setStatus("error");
      setMessage("Invalid callback URL — no access token found.");
    }
  }, [refetch, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <GlassCard className="text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <Image src="/yofriend i.svg" alt="Yo Verify" width={56} height={56} />
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner size="lg" />
            <p className="text-sm text-[rgba(237,237,237,0.5)]">Completing sign-in…</p>
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
            <h2 className="text-xl font-bold text-[#ededed] mb-2">Signed in!</h2>
            <p className="text-sm text-[rgba(237,237,237,0.5)] mb-2">{message}</p>
            <p className="text-xs text-[rgba(237,237,237,0.3)]">Redirecting to dashboard…</p>
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
            <h2 className="text-xl font-bold text-[#ededed] mb-2">Sign-in Failed</h2>
            <p className="text-sm text-[rgba(237,237,237,0.5)] mb-6">{message}</p>
            <Button onClick={() => router.push("/auth/login")} variant="secondary" className="w-full">
              Back to login
            </Button>
          </>
        )}
      </GlassCard>
    </div>
  );
}
