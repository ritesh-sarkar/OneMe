"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Icons
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

import { FcGoogle } from "react-icons/fc";

// Custom Components and libs
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  const { success, error: toastError } = useToast();

  const router = useRouter();

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const res = await login(email, password);

    setIsSubmitting(false);

    if (res.success) {
      success(
        "Logged in successfully! Welcome to OneMe.",
        "Authentication Successful",
      );

      router.push("/dashboard");
    } else {
      setErrorMsg(res.error || "Invalid credentials.");

      toastError(res.error || "Invalid credentials.", "Login Failed");
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    const res = await loginWithGoogle();

    setIsSubmitting(false);

    if (res.success) {
      success("Logged in with Google!", "Welcome");

      router.push("/dashboard");
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        flex-col
        justify-center
        items-center
        px-4
        py-12
        bg-surface-page
        relative
        overflow-hidden
      "
    >
      {/* Background glow */}
      <div
        className="
          absolute
          top-1/2
          left-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-125
          h-125
          bg-accent/15
          rounded-full
          blur-3xl
          pointer-events-none
        "
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="
          w-full
          max-w-md
          space-y-6
          relative
          z-10
        "
      >
        {/* Brand Header */}
        <div
          className="
            text-center
            space-y-2
          "
        >
          {/* logo part */}
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2.5
            "
          >
            <img
              src="/logo.jpg"
              alt="OneMe Logo"
              className="
                w-10 
                h-10"
            />

            <span
              className="
                text-2xl
                font-black
                text-primary
                tracking-tight
              "
            >
              OneMe
            </span>
          </Link>

          <h2
            className="
              text-xl
              font-bold
              text-primary
              tracking-tight
            "
          >
            Welcome back
          </h2>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
            "
          >
            Log in to manage your digital identity, projects, and contacts
          </p>
        </div>

        {/* Login Form Card */}
        <div
          className="
            p-6
            md:p-8
            rounded-3xl
            bg-surface-deep
            border
            border-subtle
            backdrop-blur-xl
            shadow-2xl
            space-y-5
          "
        >
          {errorMsg && (
            <div
              className="
                p-3
                rounded-xl
                bg-danger-soft
                border
                border-light
                text-danger
                text-sm
                md:text-base
                flex
                items-center
                gap-2
              "
            >
              <FiAlertCircle
                className="
                  w-4
                  h-4
                  shrink-0
                  text-danger
                "
              />

              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="
              space-y-4
            "
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={FiMail}
            />

            <div className="space-y-1.5">
              <div
                className="
                  flex 
                  items-center 
                  justify-between
              "
              >
                <label
                  className="
                    text-base 
                    text-primary
                    "
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="
                    text-sm
                    md:text-base
                    text-accent
                    hover:text-accent
                    transition-colors
                  "
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={FiLock}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      text-secondary
                      hover:text-primary
                      focus:outline-none
                      cursor-pointer
                    "
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                }
                className="mt-0"
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              variant="primary"
              size="lg"
              className="
                w-full
                justify-center
                glow-indigo
              "
            >
              Sign In
            </Button>
          </form>

          <div
            className="
              relative
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                border-t
                border-subtle
                w-full
              "
            />

            <span
              className="
                w-full
                text-center
                bg-surface-deep
                px-3
                text-xs
                md:text-sm
                font-mono
                font-semibold
                text-muted
                uppercase
                shrink-0
                mt-2
              "
            >
              Or continue with
            </span>
          </div>

          <Button
            onClick={handleGoogleLogin}
            type="button"
            variant="outline"
            size="md"
            className="
              w-full
              justify-center
              gap-2.5
              bg-surface-panel
              hover:bg-surface-panel
            "
          >
            <FcGoogle
              className="
                w-4
                h-4
                shrink-0
                block
              "
            />

            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Footer Link */}
        <p
          className="
            text-center
            text-sm
            md:text-base
            text-secondary
          "
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="
              font-semibold
              text-accent
              active:scale-95
            "
          >
            Create OneMe
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
