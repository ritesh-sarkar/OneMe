"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiRadio, FiShield, FiUsers } from "react-icons/fi";
import { Button } from "@/components/Button";
import { ExchangeModal } from "@/components/ExchangeModal";
import { useProfile } from "@/context/ProfileContext";

export default function ExchangeStudioPage() {
  const { profile } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const isFlowEnabled = profile?.isPublished && profile?.privacy?.allowContactExchange;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary sm:text-3xl">
            OneMe Flow
          </h1>
          <p className="mt-1 text-sm text-secondary sm:text-base">
            A verified, mutual-consent contact exchange. No proximity tracking or automatic sharing.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          variant="glow"
          size="md"
          icon={FiRadio}
        >
          Start an Exchange
        </Button>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          {
            icon: FiUsers,
            title: "Invite by username",
            detail:
              "Exchange with the verified OneMe member you met by entering their exact username.",
          },
          {
            icon: FiShield,
            title: "Choose your details",
            detail:
              "Select the specific contact fields you consent to share. Nothing is disclosed in a pending request.",
          },
          {
            icon: FiCheckCircle,
            title: "Both members approve",
            detail:
              "The recipient chooses their own share fields. The connection is created only after they accept.",
          },
        ].map(({ icon: Icon, title, detail }) => (
          <article
            key={title}
            className="space-y-3 rounded-3xl border border-subtle bg-glass p-6"
          >
            <Icon className="h-5 w-5 text-accent" />
            <h2 className="font-bold text-primary">{title}</h2>
            <p className="text-sm leading-relaxed text-secondary">{detail}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-subtle bg-glass p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-bold text-primary">Your exchange availability</h2>
          <p className="mt-1 text-sm text-secondary">
            {isFlowEnabled
              ? "Your published profile can receive OneMe Flow requests."
              : "Publish your profile and enable OneMe Flow requests to participate."}
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm font-semibold text-accent underline underline-offset-4"
        >
          Manage privacy settings
        </Link>
      </section>

      <ExchangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
