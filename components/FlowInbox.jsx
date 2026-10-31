'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiRadio, FiXCircle } from 'react-icons/fi';
import { Button } from '@/components/Button';
import { Toggle } from '@/components/Toggle';
import { useAuth } from '@/context/AuthContext';
import { useConnections } from '@/context/ConnectionsContext';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/context/ToastContext';

const FIELD_LABELS = {
  email: 'Email',
  phone: 'Phone',
  socials: 'Social profiles',
  resume: 'Resume',
};

export default function FlowInbox() {
  const { user } = useAuth();
  const { profile, resume } = useProfile();
  const { refreshConnections } = useConnections();
  const { success, error: toastError } = useToast();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [shareChoices, setShareChoices] = useState({});
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

  const loadRequests = useCallback(async () => {
    const response = await fetch('/api/flow/sessions', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Flow requests could not be loaded.');
    setIncoming(result.incoming || []);
    setOutgoing(result.outgoing || []);
    setShareChoices((current) => {
      const next = { ...current };
      for (const request of result.incoming || []) {
        if (!next[request.id]) next[request.id] = availableFields;
      }
      return next;
    });
    setErrorMessage('');
  }, [availableFields]);

  useEffect(() => {
    let active = true;
    // The loading flag reflects an external request started by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loadRequests()
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Flow requests could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadRequests]);

  const respond = async (request, action) => {
    setBusyId(request.id);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/flow/sessions/${encodeURIComponent(request.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          shareFields: action === 'accept'
            ? (shareChoices[request.id] || []).filter((field) => availableFields.includes(field))
            : [],
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Flow response could not be saved.');
      await loadRequests();
      if (action === 'accept') await refreshConnections();
      success(action === 'accept' ? 'Contact exchange completed with mutual consent.' : 'Flow request declined.');
    } catch (error) {
      setErrorMessage(error.message || 'Flow response could not be saved.');
      toastError(error.message || 'Flow response could not be saved.');
    } finally {
      setBusyId('');
    }
  };

  const cancelRequest = async (request) => {
    setBusyId(request.id);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/flow/sessions/${encodeURIComponent(request.id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Flow request could not be cancelled.');
      await loadRequests();
      success('Flow request cancelled.');
    } catch (error) {
      setErrorMessage(error.message || 'Flow request could not be cancelled.');
      toastError(error.message || 'Flow request could not be cancelled.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-subtle bg-glass p-6 backdrop-blur-xl sm:p-8">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-success-soft p-2 text-success">
          <FiRadio className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary md:text-lg">OneMe Flow Requests</h2>
          <p className="text-sm text-secondary">
            Exchange contact details only after you choose exactly what to share.
          </p>
        </div>
      </header>

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-light bg-danger-soft p-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-secondary">Loading exchange requests…</p>
      ) : (
        <>
          {incoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary">Incoming ({incoming.length})</h3>
              {incoming.map((request) => (
                <article key={request.id} className="space-y-4 rounded-2xl border border-subtle bg-surface-dark/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text-primary">{request.requester.name}</p>
                      <p className="text-sm text-secondary">
                        @{request.requester.username}{request.requester.title ? ` · ${request.requester.title}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-tertiary">
                        They chose to share: {request.shareFields.map((field) => FIELD_LABELS[field]).join(', ')}
                      </p>
                    </div>
                    <FiClock className="mt-1 h-4 w-4 shrink-0 text-tertiary" />
                  </div>

                  {availableFields.length > 0 ? (
                    <div className="space-y-3 rounded-xl border border-subtle p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                        Choose what you will share in return
                      </p>
                      {availableFields.map((field) => (
                        <Toggle
                          key={field}
                          label={FIELD_LABELS[field]}
                          description="Shared only with this accepted connection"
                          checked={(shareChoices[request.id] || []).includes(field)}
                          onChange={(checked) => setShareChoices((current) => ({
                            ...current,
                            [request.id]: checked
                              ? [...new Set([...(current[request.id] || []), field])]
                              : (current[request.id] || []).filter((item) => item !== field),
                          }))}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary">
                      Add contact details to your profile before accepting an exchange.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => respond(request, 'decline')}
                      disabled={busyId === request.id}
                      variant="outline"
                      size="sm"
                      icon={FiXCircle}
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => respond(request, 'accept')}
                      disabled={
                        busyId === request.id ||
                        !(shareChoices[request.id] || []).some((field) => availableFields.includes(field))
                      }
                      variant="glow"
                      size="sm"
                      icon={FiCheckCircle}
                    >
                      {busyId === request.id ? 'Saving…' : 'Accept & Exchange'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {outgoing.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-text-primary">Waiting for approval ({outgoing.length})</h3>
              {outgoing.map((request) => (
                <div key={request.id} className="flex items-center justify-between gap-3 rounded-xl border border-subtle bg-surface-dark/50 p-3">
                  <p className="text-sm text-secondary">
                    @{request.recipient.username} has not accepted your exchange request.
                  </p>
                  <Button
                    onClick={() => cancelRequest(request)}
                    disabled={busyId === request.id}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}

          {incoming.length === 0 && outgoing.length === 0 && (
            <p className="rounded-2xl border border-subtle bg-surface-dark/50 p-4 text-sm text-secondary">
              No pending requests. New requests appear here when someone invites your OneMe username.
            </p>
          )}
        </>
      )}
    </section>
  );
}
