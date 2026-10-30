"use client";

import React, { useState } from "react";

//icons
import {
  FiCreditCard,
  FiMail,
  FiCopy,
  FiCheck,
  FiRepeat,
} from "react-icons/fi";

// Custom Components
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { copyToClipboard } from "@/libs/utils";

const TOOL_TABS = [
  {
    id: "card",
    label: "Digital Business Card",
    icon: FiCreditCard,
  },
  {
    id: "signature",
    label: "Email Signature Builder",
    icon: FiMail,
  },
];

export default function ToolsPage() {
  const { profile } = useProfile();
  const { success } = useToast();

  const [activeTool, setActiveTool] = useState("card");
  const [cardFlipped, setCardFlipped] = useState(false);
  const [sigCopied, setSigCopied] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${profile?.username || "ritesh"}`
      : `https://oneme.app/@${profile?.username || "ritesh"}`;

  // Generate Email Signature HTML
  const generateSignatureHtml = () => {
    return `
      <table
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="font-family: Arial, sans-serif; font-size: 13px; color: #333333; line-height: 1.4;"
      >
        <tr>
          <td style="padding-right: 16px; vertical-align: top;">
            <img
              src="${profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}"
              alt="${profile?.name || "Profile avatar"}"
              width="70"
              height="70"
              style="border-radius: 50%; display: block; object-fit: cover;"
            />
          </td>

          <td style="border-left: 2px solid #6366f1; padding-left: 16px; vertical-align: top;">
            <div style="font-size: 16px; font-weight: bold; color: #111827;">
              ${profile?.name || "Ritesh Sarkar"}
            </div>

            <div style="font-size: 13px; color: #6366f1; font-weight: 600; margin-top: 2px;">
              ${profile?.title || "Full-Stack Developer"}
            </div>

            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
              📍 ${profile?.location || "Dhaka, Bangladesh"}
            </div>

            <div style="margin-top: 8px; font-size: 12px;">
              <span style="color: #4b5563;">
                ✉️ ${profile?.email || "ritesh@sarkar.dev"}
              </span>
              &nbsp;|&nbsp;
              <span style="color: #4b5563;">
                📞 ${profile?.phone || "+880 1712-345678"}
              </span>
            </div>

            <div style="margin-top: 6px; font-size: 12px;">
              <a
                href="${profileUrl}"
                style="color: #6366f1; text-decoration: none; font-weight: bold;"
              >
                ⚡ OneMe: ${profileUrl}
              </a>
            </div>
          </td>
        </tr>
      </table>
    `;
  };

  const handleCopySignature = () => {
    const html = generateSignatureHtml();

    copyToClipboard(html);
    setSigCopied(true);

    success(
      "HTML Email signature copied to clipboard! Paste directly into Gmail/Outlook.",
    );

    setTimeout(() => setSigCopied(false), 2000);
  };

  return (
    <div
      className="
        space-y-8
      "
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          justify-between
          gap-4
          sm:flex-row
          sm:items-center
        "
      >
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
            Digital Identity Tools
          </h1>

          <p
            className="
              text-xs
              text-secondary
              sm:text-sm
            "
          >
            Generate shareable business cards and copyable HTML email
            signatures.
          </p>
        </div>

        <Tabs
          tabs={TOOL_TABS}
          activeTab={activeTool}
          onChange={setActiveTool}
        />
      </div>

      {/* Tool: Digital Business Card */}
      {activeTool === "card" && (
        <div
          className="
            grid
            grid-cols-1
            items-center
            gap-8
            lg:grid-cols-12
          "
        >
          {/* Card Preview Stage */}
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              space-y-6
              rounded-3xl
              border
              border-subtle
              bg-glass
              p-8
              shadow-2xl
              backdrop-blur-xl
              sm:p-12
              lg:col-span-7
            "
          >
            <div
              onClick={() => setCardFlipped(!cardFlipped)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setCardFlipped(!cardFlipped);
                }
              }}
              aria-label="Flip digital business card"
              className="
                group
                relative
                aspect-[1.75/1]
                w-full
                max-w-md
                cursor-pointer
                select-none
                overflow-hidden
                rounded-3xl
                border
                border-light
                p-6
                shadow-[0_20px_50px_rgba(0,0,0,0.8)]
                transition-all
                duration-500
                sm:p-8
              "
              style={{
                background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
              }}
            >
              {/* Subtle NFC / Metallic Chip Graphic */}
              <div
                className="
                  absolute
                  right-6
                  top-6
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    font-mono
                    text-[10px]
                    font-bold
                    text-muted
                  "
                >
                  ONE ME NFC
                </span>

                <div
                  className="
                    flex
                    h-5
                    w-6
                    items-center
                    justify-center
                    rounded
                    border
                    border-light
                    bg-warning-soft
                  "
                >
                  <div
                    className="
                      h-2
                      w-3
                      border-b
                      border-t
                      border-light
                    "
                  />
                </div>
              </div>

              {!cardFlipped ? (
                /* Card Front */
                <div
                  className="
                    flex
                    h-full
                    flex-col
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
                    <img
                      src={
                        profile?.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                      }
                      alt={profile?.name || "Profile avatar"}
                      className="
                        h-14
                        w-14
                        rounded-full
                        border-2
                        border-accent/40
                        object-cover
                      "
                    />

                    <div>
                      <h3
                        className="
                          text-lg
                          font-bold
                          tracking-tight
                          text-primary
                        "
                      >
                        {profile?.name || "Your Name"}
                      </h3>

                      <p
                        className="
                          text-xs
                          font-medium
                          text-accent
                        "
                      >
                        {profile?.title || "Your Professional Title"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      space-y-1
                    "
                  >
                    <div
                      className="
                        font-mono
                        text-xs
                        text-secondary
                      "
                    >
                      @{profile?.username || "username"}
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        font-mono
                        text-[11px]
                        text-muted
                      "
                    >
                      <span>{profile?.email || "your@email.com"}</span>

                      <span
                        className="
                          text-accent
                        "
                      >
                        Tap to flip →
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Back */
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <div
                    className="
                      max-w-[60%]
                      space-y-2
                    "
                  >
                    <div
                      className="
                        text-xs
                        font-bold
                        text-primary
                      "
                    >
                      Scan to Connect
                    </div>

                    <p
                      className="
                        text-[11px]
                        leading-snug
                        text-secondary
                      "
                    >
                      Tap NFC or scan QR code to view live OneMe profile and
                      download contact card.
                    </p>

                    <div
                      className="
                        pt-1
                        font-mono
                        text-[10px]
                        text-accent
                      "
                    >
                      oneme.app/@{profile?.username || "username"}
                    </div>
                  </div>

                  <div
                    className="
                      shrink-0
                      rounded-xl
                      bg-white
                      p-2
                      shadow-lg
                    "
                  >
                    <div
                      className="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded
                        bg-surface-dark
                        font-mono
                        text-[10px]
                        text-primary
                      "
                    >
                      QR Code
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p
              className="
                flex
                items-center
                gap-1.5
                font-mono
                text-xs
                text-secondary
              "
            >
              <FiRepeat
                className="
                  h-3.5
                  w-3.5
                  text-accent
                "
              />

              <span>Click card to preview front/back view</span>
            </p>
          </div>

          {/* Card Info & Download */}
          <div
            className="
              space-y-6
              rounded-3xl
              border
              border-subtle
              bg-glass
              p-6
              backdrop-blur-xl
              sm:p-8
              lg:col-span-5
            "
          >
            <h3
              className="
                text-base
                font-bold
                text-primary
              "
            >
              Digital Business Card
            </h3>

            <p
              className="
                text-xs
                leading-relaxed
                text-secondary
              "
            >
              Your digital business card represents your professional brand at
              in-person conferences, coffee chats, and client meetings.
            </p>

            <div
              className="
                space-y-2
              "
            >
              <Button
                onClick={() => setCardFlipped(!cardFlipped)}
                variant="outline"
                size="md"
                className="
                  w-full
                  justify-center
                "
                icon={FiRepeat}
              >
                Flip Digital Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tool: Email Signature Builder */}
      {activeTool === "signature" && (
        <div
          className="
            grid
            grid-cols-1
            items-start
            gap-8
            lg:grid-cols-12
          "
        >
          {/* Live Signature Stage */}
          <div
            className="
              space-y-6
              rounded-3xl
              border
              border-subtle
              bg-glass
              p-6
              shadow-2xl
              backdrop-blur-xl
              sm:p-8
              lg:col-span-7
            "
          >
            <h3
              className="
                border-b
                border-subtle
                pb-3
                text-sm
                font-bold
                text-primary
              "
            >
              Live Signature Preview
            </h3>

            {/* Email Client Preview Mock */}
            <div
              className="
                space-y-4
                rounded-2xl
                border
                border-light
                bg-white
                p-6
                text-surface-dark
                shadow-xl
              "
            >
              <div
                className="
                  border-b
                  border-subtle
                  pb-2
                  font-mono
                  text-xs
                  text-secondary
                "
              >
                To: client@company.com • Subject: Project Follow-up
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: generateSignatureHtml(),
                }}
                className="
                  select-all
                "
              />
            </div>

            <Button
              onClick={handleCopySignature}
              variant="glow"
              size="lg"
              className="
                w-full
                justify-center
              "
              icon={sigCopied ? FiCheck : FiCopy}
            >
              {sigCopied ? "HTML Signature Copied!" : "Copy HTML Signature"}
            </Button>
          </div>

          {/* Signature Instructions */}
          <div
            className="
              space-y-5
              rounded-3xl
              border
              border-subtle
              bg-glass
              p-6
              backdrop-blur-xl
              sm:p-8
              lg:col-span-5
            "
          >
            <h3
              className="
                text-base
                font-bold
                text-primary
              "
            >
              How to Install
            </h3>

            <ol
              className="
                list-inside
                list-decimal
                space-y-3
                text-xs
                leading-relaxed
                text-secondary
              "
            >
              <li>
                Click <strong>Copy HTML Signature</strong> button.
              </li>

              <li>
                Open your email client settings (Gmail, Outlook, Apple Mail).
              </li>

              <li>
                Navigate to the <strong>Signatures</strong> section.
              </li>

              <li>
                Paste (Ctrl+V / Cmd+V) directly into the signature composer.
              </li>

              <li>
                Save changes. Your emails now feature your verified OneMe
                identity!
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
