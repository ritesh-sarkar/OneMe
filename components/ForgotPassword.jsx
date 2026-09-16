"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Icons
import {
  FiMail,
  FiArrowLeft,
  FiCheckCircle,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
} from "react-icons/fi";

// Custom Components and libs
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(3);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { success, error: toastError } = useToast();

  const handleSendOtp = (e) => {
    e.preventDefault();

    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(2);

      success("A verification code has been sent to your email.");
    }, 600);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    setErrorMsg("");

    if (otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");

      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(3);

      success("Email verified successfully.");
    }, 600);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");

      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");

      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      success("Your password has been reset successfully.");

      setStep(4);
    }, 600);
  };

  const handleBackToEmail = () => {
    setErrorMsg("");
    setOtp("");
    setStep(1);
  };

  const handleBackToOtp = () => {
    setErrorMsg("");
    setPassword("");
    setConfirmPassword("");
    setStep(2);
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
                md:text-3xl
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
              md:text-2xl
              font-bold
              text-primary
              tracking-tight
            "
          >
            {step === 1 && "Reset Password"}

            {step === 2 && "Verify Your Email"}

            {step === 3 && "Create New Password"}

            {step === 4 && "Password Reset Complete"}
          </h2>

          <p
            className="
              text-sm
              md:text-base
              font-semibold
              text-secondary
            "
          >
            {step === 1 && "Enter your email to receive a verification code"}

            {step === 2 && "Enter the verification code sent to your email"}

            {step === 3 && "Create a new password for your OneMe account"}

            {step === 4 && "Your password has been updated successfully"}
          </p>
        </div>

        {/* Progress Indicator */}
        {step !== 4 && (
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <div
              className={`
                w-2
                h-2
                rounded-full
                transition-all
                ${step >= 1 ? "bg-accent" : "bg-surface-panel"}
              `}
            />

            <div
              className={`
                w-8
                h-px
                transition-all
                ${step >= 2 ? "bg-accent" : "bg-border-subtle"}
              `}
            />

            <div
              className={`
                w-2
                h-2
                rounded-full
                transition-all
                ${step >= 2 ? "bg-accent" : "bg-surface-panel"}
              `}
            />

            <div
              className={`
                w-8
                h-px
                transition-all
                ${step >= 3 ? "bg-accent" : "bg-border-subtle"}
              `}
            />

            <div
              className={`
                w-2
                h-2
                rounded-full
                transition-all
                ${step >= 3 ? "bg-accent" : "bg-surface-panel"}
              `}
            />
          </div>
        )}

        {/* Main Card */}
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
          {/* Error Message */}
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
              "
            >
              {errorMsg}
            </div>
          )}

          {/* Step 1 - Email */}
          {step === 1 && (
            <form
              onSubmit={handleSendOtp}
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

              <Button
                type="submit"
                isLoading={loading}
                variant="primary"
                size="lg"
                className="
                  w-full
                  justify-center
                "
              >
                Send Verification Code
              </Button>
            </form>
          )}

          {/* Step 2 - OTP */}
          {step === 2 && (
            <form
              onSubmit={handleVerifyOtp}
              className="
                space-y-4
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  gap-3
                  py-2
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-accent-soft
                    text-accent
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FiShield
                    className="
                      w-6
                      h-6
                    "
                  />
                </div>

                <div
                  className="
                    space-y-1
                  "
                >
                  <p
                    className="
                      text-base
                      font-semibold
                      text-primary
                    "
                  >
                    Check your email
                  </p>

                  <p
                    className="
                      text-sm
                      md:text-base
                      text-secondary
                    "
                  >
                    We sent a 6-digit verification code to your email.
                  </p>
                </div>
              </div>

              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                icon={FiShield}
                className="
                  text-center
                  font-bold
                  tracking-widest
                  text-xl
                "
              />

              <Button
                type="submit"
                isLoading={loading}
                variant="primary"
                size="lg"
                className="
                  w-full
                  justify-center
                "
              >
                Verify Code
              </Button>
            </form>
          )}

          {/* Step 3 - New Password */}
          {step === 3 && (
            <form
              onSubmit={handleResetPassword}
              className="
                space-y-4
              "
            >
              <Input
                label="New Password"
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
                      cursor-pointer
                      pt-2.5
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
                }
              />

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={FiLock}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="
                      text-secondary
                      cursor-pointer
                      pt-2.5
                    "
                  >
                    {showConfirmPassword ? (
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
                }
              />

              <p
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-muted
                "
              >
                Use at least 6 characters for your new password.
              </p>

              <Button
                type="submit"
                isLoading={loading}
                variant="primary"
                size="lg"
                className="
                  w-full
                  justify-center
                "
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* Step 4 - Success */}
          {step === 4 && (
            <div
              className="
                text-center
                space-y-4
                py-4
              "
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-success-soft
                  text-success
                  flex
                  items-center
                  justify-center
                  mx-auto
                "
              >
                <FiCheckCircle
                  className="
                    w-6
                    h-6
                  "
                />
              </div>

              <h3
                className="
                  text-base
                  md:text-lg
                  font-bold
                  text-primary
                "
              >
                Password updated
              </h3>

              <p
                className="
                  text-sm
                  md:text-base
                  text-secondary
                "
              >
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>

              <Link
                href="/login"
                className="
                  block
                  pt-2
                "
              >
                <Button
                  variant="primary"
                  size="md"
                  className="
                    w-full
                    justify-center
                  "
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Back to Login */}
          {step !== 4 && (
            <div
              className="
                pt-2
                text-center
              "
            >
              <Link
                href="/login"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-sm
                  md:text-base
                  text-secondary
                  transition-all
                  duration-300
                  ease-in-out
                  hover:text-primary
                "
              >
                <FiArrowLeft
                  className="
                    w-3.5
                    h-3.5
                  "
                />

                <span>Back to login</span>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
