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

  const {
    login,
    loginWithGoogle,
  } = useAuth();

  const {
    success,
    error: toastError,
  } = useToast();

  const router = useRouter();

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const res = await login(
      email,
      password,
    );

    setIsSubmitting(false);

    if (res.success) {
      success(
        "Logged in successfully! Welcome to OneMe.",
        "Authentication Successful",
      );

      router.push("/dashboard");
    } else {
      setErrorMsg(
        res.error || "Invalid credentials.",
      );

      toastError(
        res.error || "Invalid credentials.",
        "Login Failed",
      );
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    const res = await loginWithGoogle();

    setIsSubmitting(false);

    if (res.success) {
      success(
        "Logged in with Google!",
        "Welcome",
      );

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
          w-[500px]
          h-[500px]
          bg-accent/15
          rounded-full
          blur-[120px]
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
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2.5
              group
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                gradient-brand
                p-0.5
                shadow-lg
                glow-indigo
                group-hover:scale-105
                transition-transform
              "
            >
              <div
                className="
                  w-full
                  h-full
                  bg-surface-page
                  rounded-[10px]
                  flex
                  items-center
                  justify-center
                  font-black
                  text-primary
                  text-base
                "
              >
                1M
              </div>
            </div>

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
              text-xs
              text-secondary
            "
          >
            Log in to manage your digital identity,
            projects, and contacts
          </p>
        </div>

        {/* Login Form Card */}
        <div
          className="
            p-6
            sm:p-8
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
                text-xs
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

              <span>
                {errorMsg}
              </span>
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
              placeholder="demo@oneme.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={FiMail}
            />

            <div
              className="
                space-y-1.5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <label
                  className="
                    text-xs
                    font-medium
                    text-secondary
                  "
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="
                    text-xs
                    text-accent
                    hover:text-accent
                    transition-colors
                  "
                >
                  Forgot password?
                </Link>
              </div>

              <div
                className="
                  relative
                  flex
                  items-center
                "
              >
                <div
                  className="
                    absolute
                    left-3.5
                    text-secondary
                    pointer-events-none
                    flex
                    items-center
                  "
                >
                  <FiLock
                    className="
                      w-4
                      h-4
                    "
                  />
                </div>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="
                    w-full
                    rounded-xl
                    bg-surface-deep
                    border
                    border-subtle
                    pl-10
                    pr-10
                    py-2.5
                    text-sm
                    text-primary
                    placeholder:text-muted
                    focus:border-accent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-accent/20
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-3.5
                    text-secondary
                    hover:text-primary
                  "
                >
                  {showPassword ? (
                    <FiEyeOff
                      className="
                        w-4
                        h-4
                      "
                    />
                  ) : (
                    <FiEye
                      className="
                        w-4
                        h-4
                      "
                    />
                  )}
                </button>
              </div>
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
                bg-surface-deep
                px-3
                text-[11px]
                font-mono
                text-muted
                uppercase
                shrink-0
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

            <span>
              Continue with Google
            </span>
          </Button>
        </div>

        {/* Footer Link */}
        <p
          className="
            text-center
            text-xs
            text-secondary
          "
        >
          Don&apos;t have an account?{" "}

          <Link
            href="/signup"
            className="
              font-semibold
              text-accent
              hover:text-accent
            "
          >
            Create OneMe
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

