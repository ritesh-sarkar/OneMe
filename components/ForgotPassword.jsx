"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Icons
import {
  FiMail,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";


// Custom Components and libs
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { success } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);

      success(
        "Password reset link sent to your email.",
      );
    }, 600);
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
            Reset Password
          </h2>

          <p
            className="
              text-xs
              text-secondary
            "
          >
            Enter your email to receive recovery instructions
          </p>
        </div>

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
          {submitted ? (
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
                  font-bold
                  text-primary
                "
              >
                Check your inbox
              </h3>

              <p
                className="
                  text-xs
                  text-secondary
                "
              >
                We sent a password reset link to{" "}
                <span
                  className="
                    text-primary
                    font-semibold
                  "
                >
                  {email}
                </span>
                .
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
          ) : (
            <form
              onSubmit={handleSubmit}
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
                Send Reset Link
              </Button>
            </form>
          )}

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
                text-xs
                text-secondary
                hover:text-primary
                transition-colors
              "
            >
              <FiArrowLeft
                className="
                  w-3.5
                  h-3.5
                "
              />

              <span>
                Back to login
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
