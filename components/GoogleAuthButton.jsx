"use client";

import React, { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/Button";

export default function GoogleAuthButton() {
  const [providerAvailable, setProviderAvailable] = useState(false);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (active) setProviderAvailable(Boolean(providers?.google));
      })
      .catch((error) => {
        console.error("Unable to load sign-in providers.", error?.name || "UnknownError");
        if (active) setErrorMessage("Google sign-in status could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setProvidersLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsSigningIn(true);
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error || !result?.url) {
        throw new Error("Google sign-in could not be started. Please try again.");
      }
      window.location.assign(result.url);
    } catch (error) {
      setErrorMessage(error.message || "Google sign-in is temporarily unavailable.");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={!providersLoaded || !providerAvailable}
        isLoading={isSigningIn}
        variant="outline"
        size="lg"
        icon={FcGoogle}
        className="
          w-full
          justify-center
          rounded-2xl
          border-white/10
          bg-white/[0.035]
          text-primary
          shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
          transition-all
          duration-200
          hover:border-accent/40
          hover:bg-accent/[0.08]
          hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)]
          disabled:opacity-60
        "
      >
        Continue with Google
      </Button>
      {!providersLoaded || !providerAvailable ? (
        <p className="text-center text-xs text-tertiary">
          {!providersLoaded
            ? "Checking Google sign-in availability..."
            : "Google sign-in requires OAuth credentials to be configured."}
        </p>
      ) : (
        <p className="text-center text-xs text-tertiary">
          Securely continue with your verified Google account.
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="text-center text-xs text-danger"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
