"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCheckCircle, FiLock, FiMail } from "react-icons/fi";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to request a password reset.");
      setSent(true);
    } catch (error) {
      setErrorMessage(error.message || "Password reset is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to reset the password.");
      setComplete(true);
    } catch (error) {
      setErrorMessage(error.message || "Password reset is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const title = complete
    ? "Password reset complete"
    : token
      ? "Create a new password"
      : "Reset your password";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-surface-page relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
          >
            <img
              src="/logo.jpg"
              alt="OneMe Logo"
              className="w-10 h-10"
            />
            <span className="text-2xl font-black text-primary tracking-tight">OneMe</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">{title}</h1>
          <p className="text-sm md:text-base text-secondary">
            {complete
              ? "Your password has been updated. Sign in with your new password."
              : token
                ? "Choose a new password for your OneMe account."
                : sent
                  ? "If an account exists for that email, reset instructions will be sent."
                  : "Enter your email and we will send a secure, single-use reset link."}
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-surface-deep border border-subtle backdrop-blur-xl shadow-2xl space-y-5">
          {errorMessage && (
            <p
              role="alert"
              className="p-3 rounded-xl bg-danger-soft border border-light text-danger text-sm"
            >
              {errorMessage}
            </p>
          )}

          {complete ? (
            <div className="text-center space-y-4">
              <FiCheckCircle className="w-10 h-10 text-success mx-auto" />
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-accent font-semibold"
              >
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          ) : token ? (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                icon={FiLock}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
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
                Reset Password
              </Button>
            </form>
          ) : sent ? (
            <div className="text-center space-y-3">
              <FiMail className="w-10 h-10 text-accent mx-auto" />
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-accent font-semibold"
              >
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleRequestReset}
              className="space-y-4"
            >
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                icon={FiMail}
              />
              <Button
                type="submit"
                isLoading={loading}
                variant="primary"
                size="lg"
                className="w-full justify-center"
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
