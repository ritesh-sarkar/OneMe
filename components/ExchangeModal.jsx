'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiRadio, FiRefreshCw, FiSend, FiShield } from 'react-icons/fi';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Toggle } from '@/components/Toggle';
import { useAuth } from '@/context/AuthContext';
import { useConnections } from '@/context/ConnectionsContext';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/context/ToastContext';

const FIELD_LABELS = {
  email: 'Email address',
  phone: 'Phone number',
  socials: 'Social profiles',
  resume: 'Resume',
};

async function fetchOutgoingRequests() {
  const response = await fetch('/api/flow/sessions', { cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Flow requests could not be loaded.');
  return result.outgoing || [];
}

export function ExchangeModal({ isOpen, onClose, initialUsername = '' }) {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile, resume } = useProfile();
  const { refreshConnections } = useConnections();
  const { success, error: toastError } = useToast();
  const [username, setUsername] = useState(initialUsername);
  const [shareFields, setShareFields] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const userEmail = user?.email;
  const profilePhone = profile?.phone;
  const profileSocials = profile?.socials;
  const resumeFileUrl = resume?.fileUrl;
  const availableFields = useMemo(
    () => [
      userEmail && 'email',
      profilePhone && 'phone',
      profileSocials?.some((social) => social.url) && 'socials',
      resumeFileUrl && 'resume',
    ].filter(Boolean),
    [userEmail, profilePhone, profileSocials, resumeFileUrl],
  );
  const canSend = profile?.isPublished === true && profile?.privacy?.allowContactExchange === true;

  const loadRequests = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setOutgoing(await fetchOutgoingRequests());
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Flow requests could not be loaded.');
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
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Flow requests could not be loaded.');
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
    setShareFields([]);
    setErrorMessage('');
    onClose();
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/flow/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUsername: username.trim().replace(/^@/, ''),
          shareFields,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Flow request could not be sent.');
      setUsername('');
      setShareFields([]);
      await loadRequests();
      success('Request sent. Your contact details will only be exchanged if the other member accepts.');
    } catch (error) {
      setErrorMessage(error.message || 'Flow request could not be sent.');
      toastError(error.message || 'Flow request could not be sent.');
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
            <p className="text-sm text-secondary">Sign in with a verified OneMe account to request a contact exchange.</p>
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
              Publish your profile and turn on OneMe Flow requests in Settings &amp; Privacy before you invite another member.
            </p>
            <Link href="/dashboard/settings" onClick={handleClose} className="text-sm font-semibold text-accent underline">
              Open Settings &amp; Privacy
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleRequest} className="space-y-4 rounded-2xl border border-subtle bg-surface-dark/60 p-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-text-primary">Member username</span>
                <span className="block text-xs text-secondary">Enter the exact OneMe username of the person you met.</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="off"
                  maxLength={31}
                  placeholder="@username"
                  className="w-full rounded-xl border border-subtle bg-surface-dark px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                  required
                />
              </label>

              <div className="space-y-3 rounded-xl border border-subtle p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  What you agree to share if accepted
                </p>
                {availableFields.length > 0 ? availableFields.map((field) => (
                  <Toggle
                    key={field}
                    label={FIELD_LABELS[field]}
                    description="Shared only if the other member accepts"
                    checked={shareFields.includes(field)}
                    onChange={(checked) => setShareFields((current) => (
                      checked
                        ? [...new Set([...current, field])]
                        : current.filter((item) => item !== field)
                    ))}
                  />
                )) : (
                  <p className="text-sm text-secondary">Add contact details to your profile before starting an exchange.</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={
                  submitting ||
                  !username.trim() ||
                  shareFields.length === 0 ||
                  !shareFields.every((field) => availableFields.includes(field))
                }
                variant="glow"
                size="md"
                className="w-full justify-center"
                icon={FiSend}
              >
                {submitting ? 'Sending request…' : 'Send consent request'}
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
                  <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              {outgoing.length ? outgoing.map((request) => (
                <p key={request.id} className="rounded-xl border border-subtle bg-surface-dark/50 p-3 text-sm text-secondary">
                  <FiRadio className="mr-2 inline h-4 w-4 text-accent" />
                  Waiting for @{request.recipient.username} to approve.
                </p>
              )) : (
                <p className="text-sm text-secondary">
                  {loading ? 'Loading requests…' : 'No outgoing requests are waiting for approval.'}
                </p>
              )}
            </div>
          </>
        )}

        {errorMessage && (
          <p role="alert" className="rounded-xl border border-light bg-danger-soft p-3 text-sm text-danger">
            {errorMessage}
          </p>
        )}
      </div>
    </Modal>
  );
}
