"use client";

import React, { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";

import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/Button";

import { Input } from "@/components/Input";

import { useAuth } from "@/context/AuthContext";

import { useToast } from "@/context/ToastContext";

export default function SignupPage() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup, loginWithGoogle } = useAuth();

  const { success } = useToast();

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const res = await signup(name, email, password);

    setIsSubmitting(false);

    if (res.success) {
      success("Welcome to OneMe! Your digital identity has been initialized.");

      router.push("/dashboard");
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);

    const res = await loginWithGoogle();

    setIsSubmitting(false);

    if (res.success) {
      success("Account created with Google!");

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
            Create your OneMe
          </h2>

          <p
            className="
              text-xs
              text-secondary
            "
          >
            One person. One identity. One link.
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
          <form
            onSubmit={handleSignup}
            className="
              space-y-4
            "
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Ritesh Sarkar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              icon={FiUser}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="ritesh@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={FiMail}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={FiLock}
            />

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
              Create Account
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
            onClick={handleGoogleSignup}
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
              "
            />

            <span>Sign up with Google</span>
          </Button>
        </div>

        <p
          className="
            text-center
            text-xs
            text-secondary
          "
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="
              font-semibold
              text-accent
              hover:text-accent
            "
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
