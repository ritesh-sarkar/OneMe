"use client";

import React, { useState } from "react";
import { FiCheckCircle, FiRadio, FiShield, FiUserCheck } from "react-icons/fi";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/Button";
import { ExchangeModal } from "@/components/ExchangeModal";

const FLOW_STEPS = [
  "Enter the verified member's exact username.",
  "Select which contact details you agree to share.",
  "The other member reviews and chooses their own share fields.",
  "A connection is saved only after they accept.",
];

export default function PublicExchangePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface-page text-primary">
      <LandingNavbar />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center md:px-8">
        <div className="space-y-4">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-light bg-cyan-soft px-3.5 py-1 text-sm font-mono text-cyan">
            <FiRadio className="h-4 w-4" />
            <span>OneMe Flow</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Share contact details on your terms
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-secondary md:text-base">
            OneMe Flow sends a private request to a verified member. Your email, phone, social links, or resume are never revealed unless you select them and the recipient accepts the exchange.
          </p>
        </div>

        <section className="w-full space-y-5 rounded-3xl border border-subtle bg-glass p-6 text-left shadow-2xl backdrop-blur-xl sm:p-8">
          <h2 className="text-lg font-bold text-primary">A mutual-consent exchange</h2>
          <ol className="space-y-4">
            {FLOW_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-secondary">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-3 rounded-2xl border border-subtle bg-surface-dark/60 p-4 text-xs leading-relaxed text-secondary">
            <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p>
              Requests expire after seven days. Either side can decline or cancel before acceptance, and you can remove a saved connection at any time.
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            variant="glow"
            size="lg"
            icon={FiUserCheck}
            className="w-full justify-center"
          >
            Start a consent-based exchange
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-tertiary">
            <FiCheckCircle className="h-3.5 w-3.5 text-success" />
            Nothing is shared automatically.
          </p>
        </section>
      </main>

      <LandingFooter />
      <ExchangeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
