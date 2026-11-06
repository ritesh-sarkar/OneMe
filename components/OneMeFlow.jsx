"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiGrid, FiRadio, FiSearch, FiShield, FiUserCheck, FiWifi } from "react-icons/fi";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/Button";
import { ExchangeModal } from "@/components/ExchangeModal";
import NearbyExchange from "@/components/NearbyExchange";
import { QrGenerator } from "@/components/QrGenerator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const FLOW_STEPS = [
  "Find an online member, search by username, or scan a short-lived QR code.",
  "Select which contact details you agree to share.",
  "The other member reviews and chooses their own share fields.",
  "A connection is saved only after they accept.",
];

export default function PublicExchangePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [qrSession, setQrSession] = useState(null);
  const [qrBusy, setQrBusy] = useState(false);
  const [method, setMethod] = useState("nearby");
  const [exchangeTarget, setExchangeTarget] = useState(null);
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const createQrSession = async () => {
    setQrBusy(true);
    try {
      const response = await fetch("/api/flow/qr", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "QR session could not be created.");
      setQrSession({ ...result, url: new URL(result.url, window.location.origin).toString() });
    } catch (error) {
      toastError(error.message || "QR session could not be created.");
    } finally {
      setQrBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-page text-primary">
      <LandingNavbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-4 py-12 text-center md:px-8 md:py-16">
        <div className="space-y-4">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan-soft px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-cyan">
            <FiRadio className="h-4 w-4 animate-pulse" />
            <span>OneMe Flow · Consent-first connections</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Find your people.
            <span className="block gradient-brand-text">Share on your terms.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-secondary md:text-base">
            Discover members who are online, connect directly, and choose exactly which details to exchange.
            Your contact information stays private until you both agree.
          </p>
        </div>

        <section className="w-full space-y-5 rounded-[2rem] border border-cyan/15 bg-glass p-5 text-left shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-8">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-primary">Choose how to connect</h2>
            <p className="text-sm text-secondary">
              Nearby uses authenticated presence and a real WebRTC data channel. It does not use or imply Bluetooth-distance detection.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-subtle bg-surface-dark/60 p-4 text-xs leading-relaxed text-secondary">
            <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p>
              Public identity is shown only while a member opts in. Email, phone, social links, and resume remain private until the recipient accepts and independently selects fields.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="OneMe Flow connection methods">
            {[
              { id: "nearby", label: "Nearby", icon: FiWifi },
              { id: "username", label: "Username", icon: FiSearch },
              { id: "qr", label: "QR code", icon: FiGrid },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={method === id}
                onClick={() => setMethod(id)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                  method === id
                    ? "border-accent bg-accent-soft text-primary"
                    : "border-subtle bg-surface-dark/60 text-secondary hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <div role="tabpanel">
            {method === "nearby" && (
              <NearbyExchange
                onRequestExchange={(peer) => {
                  setExchangeTarget(peer);
                  setModalOpen(true);
                }}
              />
            )}
            {method === "username" && (
              <div className="space-y-4 rounded-3xl border border-subtle bg-surface-dark/50 p-5 text-left">
                <div className="space-y-1">
                  <h3 className="font-bold text-primary">Find a OneMe member</h3>
                  <p className="text-sm text-secondary">Search by username, review the profile, then choose exactly what you offer.</p>
                </div>
                <Button
                  onClick={() => {
                    setExchangeTarget(null);
                    setModalOpen(true);
                  }}
                  variant="glow"
                  icon={FiUserCheck}
                  className="w-full justify-center"
                >
                  Search username
                </Button>
              </div>
            )}
            {method === "qr" && (
              <div className="space-y-4 rounded-3xl border border-subtle bg-surface-dark/50 p-5 text-left">
                <div className="space-y-1">
                  <h3 className="font-bold text-primary">Create a private exchange QR</h3>
                  <p className="text-sm text-secondary">
                    The QR identifies your account for five minutes. Scanning requires sign-in and does not reveal contact details.
                  </p>
                </div>
                <Button
                  onClick={createQrSession}
                  disabled={!user || qrBusy}
                  variant="outline"
                  icon={FiGrid}
                  className="w-full justify-center"
                >
                  {qrBusy ? "Creating QR…" : "Create exchange QR"}
                </Button>
                {!user && (
                  <Link
                    href="/login?callbackUrl=%2Fdashboard%2Fexchange"
                    className="inline-flex text-sm font-semibold text-accent underline"
                  >
                    Sign in to create an exchange QR
                  </Link>
                )}
                {qrSession && (
                  <div className="rounded-2xl border border-subtle bg-surface-dark/60 p-4">
                    <QrGenerator
                      url={qrSession.url}
                      title="Scan to request a contact exchange"
                      username={user?.username || "member"}
                    />
                    <p className="mt-2 text-xs text-secondary">
                      This reference expires at {new Date(qrSession.expiresAt).toLocaleTimeString()}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <ol className="grid gap-3 border-t border-subtle pt-5 sm:grid-cols-2">
            {FLOW_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-2 text-left text-xs leading-relaxed text-secondary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[10px] font-bold text-accent">
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
          <p className="flex items-center justify-center gap-1.5 text-xs text-tertiary">
            <FiCheckCircle className="h-3.5 w-3.5 text-success" />
            Nothing is shared automatically.
          </p>
        </section>
      </main>

      <LandingFooter />
      {modalOpen && (
        <ExchangeModal
          key={exchangeTarget?.username || "username-search"}
          isOpen
          initialUsername={exchangeTarget?.username || ""}
          initialUser={exchangeTarget}
          onClose={() => {
            setModalOpen(false);
            setExchangeTarget(null);
          }}
        />
      )}
    </div>
  );
}
