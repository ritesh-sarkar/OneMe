"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiRadio, FiRefreshCw, FiSend, FiShield } from "react-icons/fi";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/context/AuthContext";
import { useConnections } from "@/context/ConnectionsContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { getFlowFieldOptions } from "@/libs/flow-validation";

async function fetchOutgoingRequests() {
  const response = await fetch("/api/flow/sessions", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Flow requests could not be loaded.");
  return result.outgoing || [];
}

export function ExchangeModal({ isOpen, onClose, initialUsername = "", initialUser = null }) {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile, projects, achievements, resume } = useProfile();
  const { refreshConnections } = useConnections();
  const { success, error: toastError } = useToast();
  const [username, setUsername] = useState(initialUser?.username || initialUsername);
  const [selectedUser, setSelectedUser] = useState(initialUser);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [shareFields, setShareFields] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const availableOptions = useMemo(
    () => getFlowFieldOptions(user, profile, { projects, achievements, resume })
      .filter((field) => field.id !== "socials"),
    [user, profile, projects, achievements, resume],
  );
  const availableFields = useMemo(() => availableOptions.map((field) => field.id), [availableOptions]);
  const canSend = profile?.isPublished === true && profile?.privacy?.allowContactExchange === true;

  useEffect(() => {
    const query = username.trim().replace(/^@/, "").toLowerCase();
    if (query.length < 2 || selectedUser?.username === query) return undefined;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearching(true);
      setSearchMessage("");
      try {
        const response = await fetch(
          `/api/flow/users?q=${encodeURIComponent(query)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Member search failed.");
        setSearchResults(result.users || []);
        setSearchMessage(result.users?.length ? "" : "No available members match that username.");
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchResults([]);
          setSearchMessage(error.message || "Member search failed.");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [username, selectedUser?.username]);

  const loadRequests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setOutgoing(await fetchOutgoingRequests());
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Flow requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isOpen || !userId) return undefined;
    let active = true;
    fetchOutgoingRequests()
      .then((requests) => {
        if (active) {
          setOutgoing(requests);
          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || "Flow requests could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, userId]);

  const handleClose = () => {
    setUsername(initialUsername);
    setSelectedUser(null);
    setSearchResults([]);
    setSearchMessage("");
    setShareFields([]);
    setErrorMessage("");
    onClose();
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/flow/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUsername: selectedUser?.username,
          shareFields,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Flow request could not be sent.");
      setUsername("");
      setSelectedUser(null);
      setShareFields([]);
      await loadRequests();
      success(
        "Request sent. Your contact details will only be exchanged if the other member accepts.",
      );
    } catch (error) {
      setErrorMessage(error.message || "Flow request could not be sent.");
      toastError(error.message || "Flow request could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="OneMe Flow — Mutual Contact Exchange"
      description="Choose exactly what you share. Nothing is disclosed until the other member accepts and selects what to share in return."
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 py-2">
        {!user ? (
          <div className="space-y-3 rounded-2xl border border-subtle bg-surface-dark/60 p-5 text-center">
            <FiShield className="mx-auto h-7 w-7 text-accent" />
            <p className="text-sm text-secondary">
              Sign in with a verified OneMe account to request a contact exchange.
            </p>
            <Link
              href="/login"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-bold text-primary"
            >
              Sign in to OneMe Flow
            </Link>
          </div>
        ) : !canSend ? (
          <div className="space-y-2 rounded-2xl border border-subtle bg-surface-dark/60 p-5">
            <p className="font-semibold text-text-primary">Enable OneMe Flow first</p>
            <p className="text-sm text-secondary">
              Publish your profile and turn on OneMe Flow requests in Settings &amp; Privacy before
              you invite another member.
            </p>
            <Link
              href="/dashboard/settings"
              onClick={handleClose}
              className="text-sm font-semibold text-accent underline"
            >
              Open Settings &amp; Privacy
            </Link>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleRequest}
              className="space-y-4 rounded-2xl border border-subtle bg-surface-dark/60 p-4"
            >
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-text-primary">Member username</span>
                <span className="block text-xs text-secondary">
                  Search by username and choose the intended OneMe member.
                </span>
                <input
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setSelectedUser(null);
                    setSearchResults([]);
                    setSearchMessage("");
                    setSearching(false);
                  }}
                  autoComplete="off"
                  maxLength={31}
                  placeholder="Search username"
                  aria-label="Search OneMe usernames"
                  className="w-full rounded-xl border border-subtle bg-surface-dark px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                />
              </label>

              {searching && <p className="text-xs text-secondary">Searching OneMe members…</p>}
              {searchResults.length > 0 && (
                <ul className="max-h-56 space-y-2 overflow-y-auto" aria-label="Matching members">
                  {searchResults.map((result) => (
                    <li key={result.username}>
                      <button
                        type="button"
                        onClick={() => {
                          setUsername(`@${result.username}`);
                          setSelectedUser(result);
                          setSearchResults([]);
                          setSearchMessage("");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-subtle bg-glass p-3 text-left hover:border-accent"
                      >
                        {result.avatar ? (
                          <img
                            src={result.avatar}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent">
                            {result.name?.trim()?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-text-primary">
                            {result.name}
                          </span>
                          <span className="block truncate text-xs text-secondary">
                            @{result.username}{result.title ? ` · ${result.title}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {searchMessage && !selectedUser && (
                <p className="text-xs text-secondary" role="status">{searchMessage}</p>
              )}

              {selectedUser && (
                <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent-soft/20 p-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-primary">
                      Requesting {selectedUser.name}
                    </span>
                    <span className="block truncate text-xs text-secondary">
                      @{selectedUser.username}{selectedUser.title ? ` · ${selectedUser.title}` : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("");
                      setSelectedUser(null);
                    }}
                    className="ml-auto shrink-0 text-xs text-accent underline"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="space-y-3 rounded-xl border border-subtle p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  What you agree to share if accepted
                </p>
                {availableOptions.length > 0 ? (
                  availableOptions.map((field) => (
                    <Toggle
                      key={field.id}
                      label={field.label}
                      description="Shared only if the other member accepts"
                      checked={shareFields.includes(field.id)}
                      onChange={(checked) =>
                        setShareFields((current) =>
                          checked
                            ? [...new Set([...current, field.id])]
                            : current.filter((item) => item !== field.id),
                        )
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-secondary">
                    Add contact details to your profile before starting an exchange.
                  </p>
                )}
              </div>

              {selectedUser && (
                <div className="rounded-xl border border-accent/30 bg-accent-soft/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    Exchange request preview
                  </p>
                  <p className="mt-1 text-sm text-text-primary">
                    To @{selectedUser.username}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    You propose to share: {availableOptions
                      .filter((field) => shareFields.includes(field.id))
                      .map((field) => field.label)
                      .join(", ") || "No fields selected"}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    Nothing is shared unless the recipient approves and chooses their own fields.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  submitting ||
                  !selectedUser ||
                  shareFields.length === 0 ||
                  !shareFields.every((field) => availableFields.includes(field))
                }
                variant="glow"
                size="md"
                className="w-full justify-center"
                icon={FiSend}
              >
                {submitting ? "Sending request…" : "Send consent request"}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">Pending invites</h3>
                <button
                  type="button"
                  onClick={loadRequests}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary"
                >
                  <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
              {outgoing.length ? (
                outgoing.map((request) => (
                  <p
                    key={request.id}
                    className="rounded-xl border border-subtle bg-surface-dark/50 p-3 text-sm text-secondary"
                  >
                    <FiRadio className="mr-2 inline h-4 w-4 text-accent" />
                    Waiting for @{request.recipient.username} to approve.
                  </p>
                ))
              ) : (
                <p className="text-sm text-secondary">
                  {loading ? "Loading requests…" : "No outgoing requests are waiting for approval."}
                </p>
              )}
            </div>
          </>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl border border-light bg-danger-soft p-3 text-sm text-danger"
          >
            {errorMessage}
          </p>
        )}
      </div>
    </Modal>
  );
}
