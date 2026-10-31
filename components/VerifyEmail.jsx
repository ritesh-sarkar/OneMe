"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle, FiLock, FiMail } from "react-icons/fi";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const sentTo = searchParams.get("sent") || "";
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to verify this email.");
      setVerified(true);
    } catch (error) {
      setErrorMessage(error.message || "Email verification is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface-page">
      <div className="w-full max-w-md space-y-5 rounded-3xl bg-surface-deep border border-subtle p-8 text-center">
        {verified ? (
          <>
            <FiCheckCircle className="w-12 h-12 text-success mx-auto" />
            <h1 className="text-2xl font-bold text-primary">Email verified</h1>
            <p className="text-secondary">
              Your account is active. Sign in to finish setting up your OneMe profile.
            </p>
            <Link
              href="/login"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-accent px-5 py-3 font-semibold text-primary transition hover:brightness-110"
            >
              Continue to sign in
            </Link>
          </>
        ) : (
          <>
            <FiMail className="w-12 h-12 text-accent mx-auto" />
            <h1 className="text-2xl font-bold text-primary">
              {sentTo ? "Check your inbox" : "Verify your email"}
            </h1>
            <p className="text-secondary">
              {sentTo
                ? `We sent a verification button to ${sentTo}. Open it to confirm your email and activate your account.`
                : "Use the secure button in the OneMe email to confirm your email address and activate your account."}
            </p>
            {errorMessage && (
              <p
                role="alert"
                className="text-danger"
              >
                {errorMessage}
              </p>
            )}
            {token ? (
              <form
                onSubmit={handleVerify}
                className="space-y-4 text-left"
              >
                <p className="text-xs leading-relaxed text-secondary">
                  For your security, choose a password different from the one entered during signup.
                  This prevents someone else from reserving your email address with a password they
                  know.
                </p>
                <Input
                  label="Choose your sign-in password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                  icon={FiLock}
                />
                <Input
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                  icon={FiLock}
                />
                <Button
                  type="submit"
                  isLoading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                >
                  Verify Email and Activate Account
                </Button>
              </form>
            ) : (
              <p className="text-sm text-secondary">
                {sentTo
                  ? "The link expires after one hour. If it does not arrive, check your spam folder or request another email from the sign-in page."
                  : "This link is missing its verification token. Request another email from the sign-in page."}
              </p>
            )}
            <Link
              href="/login"
              className="inline-block cursor-pointer text-sm font-semibold text-accent hover:underline"
            >
              Return to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
