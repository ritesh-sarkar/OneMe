"use client";

import React from "react";
import { motion } from "framer-motion";

// Icons
import {
  FiSettings,
  FiShield,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiGlobe,
  FiRefreshCw,
  FiLogOut,
  FiGithub,
  FiLinkedin,
  FiBookOpen,
} from "react-icons/fi";

import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { Input } from "@/components/Input";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function SettingsPage() {
  const { profile, updateProfile, resetToDemo } = useProfile();

  const { logout } = useAuth();
  const { success, info } = useToast();

  const privacy = profile?.privacy || {
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showResume: true,
    searchEngineIndexing: true,
    allowContactExchange: true,
  };

  const handlePrivacyToggle = (key, value) => {
    updateProfile({
      privacy: {
        ...privacy,
        [key]: value,
      },
    });

    success("Privacy preference updated.");
  };

  return (
    <div
      className="
        max-w-4xl
        space-y-8
      "
    >
      {/* Header */}
      <div>
        <h1
          className="
            text-2xl
            font-black
            tracking-tight
            text-primary
            sm:text-3xl
          "
        >
          Settings & Privacy
        </h1>

        <p
          className="
            text-xs
            text-secondary
            sm:text-sm
          "
        >
          Manage your identity privacy, search visibility, and verified
          credentials.
        </p>
      </div>

      {/* Privacy Controls Panel */}
      <div
        className="
          space-y-6
          rounded-3xl
          border
          border-subtle
          bg-glass
          p-6
          shadow-xl
          backdrop-blur-xl
          sm:p-8
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-subtle
            pb-4
          "
        >
          <div
            className="
              rounded-xl
              bg-accent-soft
              p-2
              text-accent
            "
          >
            <FiShield
              className="
                h-5
                w-5
              "
            />
          </div>

          <div>
            <h3
              className="
                text-base
                font-bold
                text-primary
              "
            >
              Profile Field Privacy
            </h3>

            <p
              className="
                text-xs
                text-secondary
              "
            >
              Control which sensitive fields are visible on your public OneMe
              link.
            </p>
          </div>
        </div>

        <div
          className="
            space-y-4
            divide-y
            divide-zinc-800/60
          "
        >
          <div
            className="
              pt-2
            "
          >
            <Toggle
              label="Public Email Address"
              description="Allow visitors to email you directly from your profile"
              checked={privacy.showEmail !== false}
              onChange={(value) => handlePrivacyToggle("showEmail", value)}
            />
          </div>

          <div
            className="
              pt-4
            "
          >
            <Toggle
              label="Public Phone Number"
              description="Display phone number on contact card and vCard downloads"
              checked={privacy.showPhone !== false}
              onChange={(value) => handlePrivacyToggle("showPhone", value)}
            />
          </div>

          <div
            className="
              pt-4
            "
          >
            <Toggle
              label="Public Location"
              description="Show city and country badge (e.g. Dhaka, Bangladesh)"
              checked={privacy.showLocation !== false}
              onChange={(value) => handlePrivacyToggle("showLocation", value)}
            />
          </div>

          <div
            className="
              pt-4
            "
          >
            <Toggle
              label="Public Resume Download"
              description="Allow visitors to download your attached CV file"
              checked={privacy.showResume !== false}
              onChange={(value) => handlePrivacyToggle("showResume", value)}
            />
          </div>

          <div
            className="
              pt-4
            "
          >
            <Toggle
              label="OneMe Flow Radar Discovery"
              description="Permit nearby OneMe members to discover your device in contact exchanges"
              checked={privacy.allowContactExchange !== false}
              onChange={(value) =>
                handlePrivacyToggle("allowContactExchange", value)
              }
            />
          </div>
        </div>
      </div>

      {/* Verification & Trust Badges */}
      <div
        className="
          space-y-6
          rounded-3xl
          border
          border-subtle
          bg-glass
          p-6
          shadow-xl
          backdrop-blur-xl
          sm:p-8
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-subtle
            pb-4
          "
        >
          <div
            className="
              rounded-xl
              bg-success-soft
              p-2
              text-success
            "
          >
            <FiCheckCircle
              className="
                h-5
                w-5
              "
            />
          </div>

          <div>
            <h3
              className="
                text-base
                font-bold
                text-primary
              "
            >
              Verified Identity Badges
            </h3>

            <p
              className="
                text-xs
                text-secondary
              "
            >
              Proof-of-identity credentials displayed on your public profile.
            </p>
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
          "
        >
          {/* Email Verification */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-subtle
              bg-surface-dark/70
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  bg-accent-soft
                  p-2
                  text-accent
                "
              >
                <FiCheckCircle
                  className="
                    h-4
                    w-4
                  "
                />
              </div>

              <div>
                <div
                  className="
                    text-xs
                    font-bold
                    text-primary
                  "
                >
                  Email Verified
                </div>

                <div
                  className="
                    font-mono
                    text-[10px]
                    text-secondary
                  "
                >
                  {profile.email}
                </div>
              </div>
            </div>

            <span
              className="
                rounded-full
                border
                border-light
                bg-success-soft
                px-2
                py-0.5
                text-[10px]
                font-bold
                text-success
              "
            >
              Active
            </span>
          </div>

          {/* GitHub Verification */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-subtle
              bg-surface-dark/70
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  bg-glass-soft
                  p-2
                  text-secondary
                "
              >
                <FiGithub
                  className="
                    h-4
                    w-4
                  "
                />
              </div>

              <div>
                <div
                  className="
                    text-xs
                    font-bold
                    text-primary
                  "
                >
                  GitHub Connected
                </div>

                <div
                  className="
                    font-mono
                    text-[10px]
                    text-secondary
                  "
                >
                  @riteshsarkar
                </div>
              </div>
            </div>

            <span
              className="
                rounded-full
                border
                border-light
                bg-success-soft
                px-2
                py-0.5
                text-[10px]
                font-bold
                text-success
              "
            >
              Verified
            </span>
          </div>

          {/* LinkedIn Verification */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-subtle
              bg-surface-dark/70
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  bg-cyan-soft
                  p-2
                  text-cyan
                "
              >
                <FiLinkedin
                  className="
                    h-4
                    w-4
                  "
                />
              </div>

              <div>
                <div
                  className="
                    text-xs
                    font-bold
                    text-primary
                  "
                >
                  LinkedIn Connected
                </div>

                <div
                  className="
                    font-mono
                    text-[10px]
                    text-secondary
                  "
                >
                  in/riteshsarkar
                </div>
              </div>
            </div>

            <span
              className="
                rounded-full
                border
                border-light
                bg-success-soft
                px-2
                py-0.5
                text-[10px]
                font-bold
                text-success
              "
            >
              Verified
            </span>
          </div>

          {/* University Affiliation */}
          <div
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-subtle
              bg-surface-dark/70
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  bg-warning-soft
                  p-2
                  text-warning
                "
              >
                <FiBookOpen
                  className="
                    h-4
                    w-4
                  "
                />
              </div>

              <div>
                <div
                  className="
                    text-xs
                    font-bold
                    text-primary
                  "
                >
                  University Affiliation
                </div>

                <div
                  className="
                    text-[10px]
                    text-secondary
                  "
                >
                  Daffodil Int. University
                </div>
              </div>
            </div>

            <span
              className="
                rounded-full
                border
                border-light
                bg-success-soft
                px-2
                py-0.5
                text-[10px]
                font-bold
                text-success
              "
            >
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div
        className="
          space-y-4
          rounded-3xl
          border
          border-subtle
          bg-glass
          p-6
          shadow-xl
          backdrop-blur-xl
          sm:p-8
        "
      >
        <h3
          className="
            border-b
            border-subtle
            pb-3
            text-base
            font-bold
            text-primary
          "
        >
          Account Administration
        </h3>

        {/* Reset Demo Data */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                text-xs
                font-bold
                text-primary
              "
            >
              Reset Local Prototype Data
            </div>

            <div
              className="
                text-[11px]
                text-secondary
              "
            >
              Revert all profile changes back to default demo state
            </div>
          </div>

          <Button
            onClick={() => {
              resetToDemo();
              success("Profile reset to original demo state.");
            }}
            variant="outline"
            size="sm"
            icon={FiRefreshCw}
          >
            Reset to Demo
          </Button>
        </div>

        {/* Sign Out */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
            border-t
            border-subtle
            pt-4
          "
        >
          <div>
            <div
              className="
                text-xs
                font-bold
                text-danger
              "
            >
              Sign Out of OneMe
            </div>

            <div
              className="
                text-[11px]
                text-secondary
              "
            >
              Clear active demo session
            </div>
          </div>

          <Button onClick={logout} variant="danger" size="sm" icon={FiLogOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
