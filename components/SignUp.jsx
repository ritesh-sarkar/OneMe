"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Icons
import { FiUser, FiMail, FiAtSign, FiLock } from "react-icons/fi";

// Custom Components and libs
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();

  const { success, error: toastError } = useToast();

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await signup(name, username, email, password);
      if (res.success) {
        success(res.message || "Check your inbox for an email verification link.");
        router.push(`/verify-email?sent=${encodeURIComponent(email)}`);
      } else {
        toastError(res.error || "Unable to create an account.", "Registration Failed");
      }
    } finally {
      setIsSubmitting(false);
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
      {/* bg shadow blob */}
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
        viewport={{
          once: false,
        }}
        className="
          w-full
          max-w-md
          space-y-6
          relative
          z-10
        "
      >
        {/* Branding  */}
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
            Create your OneMe
          </h2>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
            "
          >
            Create your account, then verify your email to activate it.
          </p>
        </div>

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
          <form
            onSubmit={handleSignup}
            className="
              space-y-4
            "
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              icon={FiUser}
            />

            <Input
              label="Username"
              type="text"
              placeholder="john-doe"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              autoComplete="username"
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
              required
              icon={FiAtSign}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={FiMail}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              required
              icon={FiLock}
            />

            <p className="text-xs leading-relaxed text-secondary">
              Verify your email before signing in. The verification page will ask you to choose a
              different final password for account security.
            </p>

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
        </div>

        <p
          className="
            text-center
            text-sm
            md:text-base
            text-secondary
          "
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="
              font-semibold
              text-accent
              active:scale-0.95
            "
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
