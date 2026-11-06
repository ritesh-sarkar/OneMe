"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiRadio, FiShield } from "react-icons/fi";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { getFlowFieldOptions } from "@/libs/flow-validation";

export default function QrExchange({ token }) {
  const { user } = useAuth();
  const { profile, projects, achievements, resume } = useProfile();
  const { success, error: toastError } = useToast();
  const [recipient, setRecipient] = useState(null);
  const [shareFields, setShareFields] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.id));
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);
  const availableOptions = useMemo(
    () => getFlowFieldOptions(user, profile, { projects, achievements, resume })
      .filter((field) => field.id !== "socials"),
    [user, profile, projects, achievements, resume],
  );
  const availableFields = useMemo(() => availableOptions.map((field) => field.id), [availableOptions]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const controller = new AbortController();
    fetch(`/api/flow/qr/${encodeURIComponent(token)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "QR session is unavailable.");
        setRecipient(result.recipient);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "QR session is unavailable.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, user?.id]);

  const sendRequest = async () => {
    setSending(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/flow/qr/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareFields }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Exchange request could not be sent.");
      setSent(true);
      success("Request sent. The other member must approve and choose what to share.");
    } catch (error) {
      setErrorMessage(error.message || "Exchange request could not be sent.");
      toastError(error.message || "Exchange request could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-1 items-center px-4 py-12">
      <section className="w-full space-y-5 rounded-3xl border border-subtle bg-glass p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-accent-soft p-2 text-accent"><FiRadio className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-primary">OneMe Flow QR Exchange</h1>
            <p className="text-sm text-secondary">Identity first. Contact details only after mutual approval.</p>
          </div>
        </div>

        {!user ? (
          <div className="space-y-3 rounded-2xl border border-subtle bg-surface-dark/60 p-4">
            <p className="flex items-start gap-2 text-sm text-secondary">
              <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Sign in before viewing the intended member or initiating an exchange.
            </p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/dashboard/exchange/qr/${token}`)}`}
              className="btn-base btn-primary inline-flex"
            >
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <p className="text-sm text-secondary">Validating this short-lived QR session…</p>
        ) : errorMessage && !recipient ? (
          <p role="alert" className="rounded-xl border border-light bg-danger-soft p-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : sent ? (
          <div className="space-y-2 rounded-2xl border border-success/30 bg-success-soft/30 p-4">
            <h2 className="font-semibold text-primary">Request sent</h2>
            <p className="text-sm text-secondary">
              Your selected details remain private until {recipient?.name} accepts and independently chooses what to share.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-subtle bg-surface-dark/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary">You scanned</p>
              <p className="mt-1 font-bold text-primary">{recipient?.name}</p>
              <p className="text-sm text-secondary">
                @{recipient?.username}{recipient?.title ? ` · ${recipient.title}` : ""}
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-subtle p-4">
              <h2 className="text-sm font-bold text-primary">Choose what you offer to share</h2>
              {availableOptions.length ? availableOptions.map((field) => (
                <Toggle
                  key={field.id}
                  label={field.label}
                  description="Shared only if the other member accepts"
                  checked={shareFields.includes(field.id)}
                  onChange={(checked) => setShareFields((current) => (
                    checked
                      ? [...new Set([...current, field.id])]
                      : current.filter((value) => value !== field.id)
                  ))}
                />
              )) : (
                <p className="text-sm text-secondary">Add contact details to your profile before requesting an exchange.</p>
              )}
            </div>
            <p className="text-xs leading-relaxed text-secondary">
              The QR identifies a recipient only. It does not disclose contact information or grant access.
            </p>
            <Button
              onClick={sendRequest}
              disabled={sending || !shareFields.length || !shareFields.every((field) => availableFields.includes(field))}
              className="w-full justify-center"
            >
              {sending ? "Sending request…" : "Send exchange request"}
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
