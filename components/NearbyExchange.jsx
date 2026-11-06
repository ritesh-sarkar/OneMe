"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiLoader,
  FiRadio,
  FiShield,
  FiUserPlus,
  FiWifi,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const ACTIVE_EXCHANGE_STATUSES = new Set(["accepted", "connected"]);

async function requestJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "Nearby exchange could not be completed.");
    error.status = response.status;
    throw error;
  }
  return result;
}

function MemberAvatar({ card }) {
  return card.avatar ? (
    <img
      src={card.avatar}
      alt=""
      className="h-11 w-11 rounded-full border border-subtle object-cover"
    />
  ) : (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent">
      {card.name?.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function MemberCard({ card, children, detail }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-subtle bg-surface-dark/60 p-3">
      <MemberAvatar card={card} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-primary">{card.name}</p>
        <p className="truncate text-xs text-secondary">
          @{card.username}{card.title ? ` · ${card.title}` : ""}
        </p>
        {detail && <p className="mt-1 text-xs text-tertiary">{detail}</p>}
      </div>
      {children}
    </div>
  );
}

export default function NearbyExchange({ onRequestExchange }) {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [sessionId, setSessionId] = useState("");
  const [ownCard, setOwnCard] = useState(null);
  const [peers, setPeers] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [connectedPeer, setConnectedPeer] = useState(null);
  const [starting, setStarting] = useState(false);
  const [busyExchange, setBusyExchange] = useState("");
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const presenceRef = useRef("");
  const ownCardRef = useRef(null);
  const exchangesRef = useRef([]);
  const iceServersRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const activeExchangeRef = useRef("");
  const seenSignalIdsRef = useRef(new Set());
  const pendingCandidatesRef = useRef([]);
  const startedExchangesRef = useRef(new Set());
  const pollingRef = useRef(false);

  const sendSignal = useCallback(async (exchangeId, kind, payload) => {
    const activeSessionId = presenceRef.current;
    if (!activeSessionId) throw new Error("Nearby discovery has stopped.");
    await requestJson(`/api/flow/nearby/exchanges/${encodeURIComponent(exchangeId)}/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        sessionId: activeSessionId,
        signalId: crypto.randomUUID(),
        signal: { kind, payload },
      }),
    });
  }, []);

  const handleIdentityChannel = useCallback((channel, exchange) => {
    const expectedPeer = exchange.peer;
    channel.onopen = () => {
      const card = ownCardRef.current;
      if (!card || channel.readyState !== "open") return;
      channel.send(JSON.stringify({ type: "identity", card }));
    };
    channel.onmessage = (event) => {
      try {
        const content = JSON.parse(event.data);
        if (
          content?.type !== "identity"
          || content.card?.username !== expectedPeer?.username
          || typeof content.card?.name !== "string"
        ) return;
        setConnectedPeer(expectedPeer);
        setMessage("A secure peer-to-peer data channel is open. Contact details remain private until a separate mutual-consent request is accepted.");
        void requestJson(`/api/flow/nearby/exchanges/${encodeURIComponent(exchange.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "connected",
            sessionId: presenceRef.current,
          }),
        }).catch((error) => setMessage(error.message));
      } catch {
        setMessage("The connected device sent an unreadable identity message.");
      }
    };
  }, []);

  const createPeerConnection = useCallback((exchange) => {
    if (peerConnectionRef.current && activeExchangeRef.current === exchange.id) {
      return peerConnectionRef.current;
    }
    if (typeof RTCPeerConnection === "undefined") {
      throw new Error("This browser does not support WebRTC data channels.");
    }
    peerConnectionRef.current?.close();
    const connection = new RTCPeerConnection({
      iceServers: iceServersRef.current || [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    activeExchangeRef.current = exchange.id;
    peerConnectionRef.current = connection;
    setConnectedPeer(null);

    connection.onicecandidate = (event) => {
      if (!event.candidate) return;
      void sendSignal(exchange.id, "candidate", event.candidate.toJSON())
        .catch((error) => setMessage(error.message));
    };
    connection.onconnectionstatechange = () => {
      if (["failed", "disconnected"].includes(connection.connectionState)) {
        setMessage(
          "The peer connection was interrupted. Check both networks or configure TURN for restrictive NATs, then reconnect.",
        );
      }
    };
    connection.ondatachannel = (event) => {
      if (event.channel.label === "oneme-identity") {
        handleIdentityChannel(event.channel, exchange);
      }
    };
    return connection;
  }, [handleIdentityChannel, sendSignal]);

  const startOffer = useCallback(async (exchange) => {
    if (startedExchangesRef.current.has(exchange.id)) return;
    startedExchangesRef.current.add(exchange.id);
    try {
      const connection = createPeerConnection(exchange);
      const channel = connection.createDataChannel("oneme-identity", { ordered: true });
      handleIdentityChannel(channel, exchange);
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await sendSignal(exchange.id, "offer", {
        type: offer.type,
        sdp: offer.sdp,
      });
      setMessage(`Waiting for ${exchange.peer.name} to establish a secure peer-to-peer connection…`);
    } catch (error) {
      startedExchangesRef.current.delete(exchange.id);
      setMessage(error.message || "WebRTC offer could not be created.");
    }
  }, [createPeerConnection, handleIdentityChannel, sendSignal]);

  const processSignal = useCallback(async (signal, exchange) => {
    if (seenSignalIdsRef.current.has(signal.id)) return;
    const connection = createPeerConnection(exchange);

    if (signal.kind === "offer" && exchange.role === "recipient") {
      await connection.setRemoteDescription(signal.payload);
      for (const candidate of pendingCandidatesRef.current.splice(0)) {
        await connection.addIceCandidate(candidate);
      }
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      await sendSignal(exchange.id, "answer", {
        type: answer.type,
        sdp: answer.sdp,
      });
    } else if (signal.kind === "answer" && exchange.role === "initiator") {
      await connection.setRemoteDescription(signal.payload);
      for (const candidate of pendingCandidatesRef.current.splice(0)) {
        await connection.addIceCandidate(candidate);
      }
    } else if (signal.kind === "candidate") {
      const candidate = new RTCIceCandidate(signal.payload);
      if (connection.remoteDescription) {
        await connection.addIceCandidate(candidate);
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    } else if (signal.kind !== "offer" && signal.kind !== "answer") {
      throw new Error("Unsupported WebRTC signaling message.");
    }
    seenSignalIdsRef.current.add(signal.id);
  }, [createPeerConnection, sendSignal]);

  const poll = useCallback(async (activeSessionId) => {
    if (pollingRef.current || !activeSessionId) return;
    pollingRef.current = true;
    try {
      const result = await requestJson(
        `/api/flow/nearby/sessions/${encodeURIComponent(activeSessionId)}`,
      );
      ownCardRef.current = result.ownCard;
      exchangesRef.current = result.exchanges || [];
      setOwnCard(result.ownCard);
      setPeers(result.peers || []);
      setExchanges(result.exchanges || []);
      setLastUpdated(new Date());
      const exchangeById = new Map((result.exchanges || []).map((exchange) => [exchange.id, exchange]));
      for (const signal of result.signals || []) {
        const exchange = exchangeById.get(signal.exchangeId);
        if (!exchange || !ACTIVE_EXCHANGE_STATUSES.has(exchange.status)) continue;
        await processSignal(signal, exchange);
        await requestJson(
          `/api/flow/nearby/exchanges/${encodeURIComponent(signal.exchangeId)}/signals`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ack",
              sessionId: activeSessionId,
              signalIds: [signal.id],
            }),
          },
        );
      }

      const activeExchange = (result.exchanges || []).find((exchange) => (
        ACTIVE_EXCHANGE_STATUSES.has(exchange.status)
      ));
      if (activeExchange?.status === "accepted" && activeExchange.role === "initiator") {
        await startOffer(activeExchange);
      } else if (!activeExchange) {
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        activeExchangeRef.current = "";
        pendingCandidatesRef.current = [];
        startedExchangesRef.current.clear();
        setConnectedPeer(null);
      }
    } catch (error) {
      setMessage(error.message || "Nearby members could not be refreshed.");
      if ([401, 403, 404].includes(error.status)) {
        presenceRef.current = "";
        setSessionId("");
        setOwnCard(null);
        setPeers([]);
        setExchanges([]);
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        activeExchangeRef.current = "";
        setConnectedPeer(null);
      }
    } finally {
      pollingRef.current = false;
    }
  }, [processSignal, startOffer]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const timer = setInterval(() => void poll(sessionId), 4_000);
    const initialPoll = setTimeout(() => void poll(sessionId), 0);
    return () => {
      clearInterval(timer);
      clearTimeout(initialPoll);
    };
  }, [poll, sessionId]);

  useEffect(() => {
    presenceRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return undefined;
    return () => {
      const activeSessionId = sessionId;
      void fetch(`/api/flow/nearby/sessions/${encodeURIComponent(activeSessionId)}`, {
        method: "DELETE",
        keepalive: true,
        cache: "no-store",
      });
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      presenceRef.current = "";
    };
  }, [sessionId]);

  const startDiscovery = async () => {
    if (!user) {
      setMessage("Sign in with a verified OneMe account to use Nearby exchange.");
      return;
    }
    if (!window.isSecureContext || typeof RTCPeerConnection === "undefined") {
      setMessage("This browser cannot start a secure WebRTC connection. Use a current browser over HTTPS.");
      return;
    }
    setStarting(true);
    setMessage("");
    try {
      const ice = await requestJson("/api/flow/nearby/ice");
      const { session } = await requestJson("/api/flow/nearby/sessions", { method: "POST" });
      iceServersRef.current = ice.iceServers;
      setSessionId(session.id);
      presenceRef.current = session.id;
      ownCardRef.current = session.card;
      setOwnCard(session.card);
      setMessage(ice.relayAvailable
        ? "Visible to other online OneMe Flow members. TURN relay is available for restrictive networks."
        : "Visible to other online OneMe Flow members. This network may require TURN relay for some peer connections.");
    } catch (error) {
      setMessage(error.message || "Nearby discovery could not be started.");
    } finally {
      setStarting(false);
    }
  };

  const stopDiscovery = async () => {
    const activeSessionId = presenceRef.current;
    if (!activeSessionId) return;
    setBusyExchange("stop");
    try {
      const active = exchangesRef.current.find((exchange) => (
        ACTIVE_EXCHANGE_STATUSES.has(exchange.status) || exchange.status === "pending"
      ));
      if (active) {
        await requestJson(`/api/flow/nearby/exchanges/${encodeURIComponent(active.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close" }),
        });
      }
      await requestJson(`/api/flow/nearby/sessions/${encodeURIComponent(activeSessionId)}`, {
        method: "DELETE",
      });
      setSessionId("");
      setOwnCard(null);
      setPeers([]);
      setExchanges([]);
      setConnectedPeer(null);
      setMessage("Nearby visibility is off. Your presence and peer connection have been stopped.");
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      activeExchangeRef.current = "";
      presenceRef.current = "";
    } catch (error) {
      setMessage(error.message || "Nearby discovery could not be stopped.");
    } finally {
      setBusyExchange("");
    }
  };

  const invite = async (targetSessionId) => {
    const activeSessionId = presenceRef.current;
    if (!activeSessionId) return;
    setBusyExchange(targetSessionId);
    setMessage("");
    try {
      await requestJson("/api/flow/nearby/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, targetSessionId }),
      });
      await poll(activeSessionId);
      setMessage("Invitation sent. The other member must accept before a peer connection starts.");
    } catch (error) {
      setMessage(error.message || "Nearby invitation could not be sent.");
    } finally {
      setBusyExchange("");
    }
  };

  const respond = async (exchangeId, action) => {
    setBusyExchange(exchangeId);
    setMessage("");
    try {
      await requestJson(`/api/flow/nearby/exchanges/${encodeURIComponent(exchangeId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (presenceRef.current) await poll(presenceRef.current);
    } catch (error) {
      setMessage(error.message || "Nearby invitation could not be updated.");
    } finally {
      setBusyExchange("");
    }
  };

  const incoming = exchanges.filter((exchange) => exchange.role === "recipient" && exchange.status === "pending");
  const outgoing = exchanges.filter((exchange) => exchange.role === "initiator" && exchange.status === "pending");
  const activeExchange = exchanges.find((exchange) => ACTIVE_EXCHANGE_STATUSES.has(exchange.status));

  return (
    <section className="w-full space-y-5 rounded-[1.75rem] border border-cyan/15 bg-surface-dark/60 p-5 text-left shadow-[0_0_70px_-38px_rgba(0,242,254,0.55)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`rounded-2xl p-3 ${sessionId ? "bg-success-soft text-success" : "bg-cyan-soft text-cyan"}`}>
            {sessionId ? <FiWifi className="h-6 w-6" /> : <FiRadio className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-primary">Nearby sharing</h2>
              <span className="rounded-full border border-cyan/20 bg-cyan-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
                {sessionId ? `${peers.length} online` : "Private by default"}
              </span>
            </div>
            <p className="mt-1 text-sm text-secondary">
              Connect directly with OneMe members who have chosen to be visible.
            </p>
          </div>
        </div>
        {user ? (
          <Button
            onClick={sessionId ? stopDiscovery : startDiscovery}
            disabled={starting || busyExchange === "stop"}
            variant={sessionId ? "outline" : "glow"}
            icon={sessionId ? FiX : FiWifi}
            className="shrink-0"
          >
            {starting ? "Starting…" : busyExchange === "stop" ? "Stopping…" : sessionId ? "Stop discovery" : "Enable Nearby"}
          </Button>
        ) : (
          <Link
            href="/login?callbackUrl=%2Fdashboard%2Fexchange"
            className="btn-base btn-primary inline-flex shrink-0 items-center justify-center"
          >
            Sign in to OneMe Flow
          </Link>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-subtle bg-surface-dark/50 p-3 text-xs leading-relaxed text-secondary">
        <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p>
          This is opt-in online discovery, not Bluetooth distance sensing. Only your public name, username, headline, and avatar appear. Contacts are shared only through a separate mutual-consent request.
        </p>
      </div>

      {!sessionId ? (
        <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-cyan/15 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="grid items-center gap-7 sm:grid-cols-[minmax(170px,0.75fr)_1.25fr] sm:gap-10">
            <div className="relative mx-auto flex aspect-square w-full max-w-52 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-cyan/10" />
              <span className="absolute inset-[12%] rounded-full border border-cyan/15" />
              <span className="absolute inset-[25%] rounded-full border border-cyan/20" />
              <span className="absolute inset-[12%] rounded-full border border-cyan/20 animate-ping motion-reduce:animate-none" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan/30 bg-surface-dark text-cyan shadow-[0_0_45px_-12px_rgba(0,242,254,0.75)]">
                <FiWifi className="h-8 w-8" />
              </span>
              <span className="absolute bottom-[13%] right-[14%] h-3 w-3 rounded-full border-2 border-surface-dark bg-cyan shadow-[0_0_14px_rgba(0,242,254,0.9)]" />
              <span className="absolute left-[13%] top-[25%] h-2 w-2 rounded-full bg-indigo-400/80 shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
            </div>
            <div className="space-y-4 text-center sm:text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">OneMe Nearby</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-primary sm:text-3xl">
                  Your space. Your choice.
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
                  Turn on visibility to find other opted-in members. Only your public profile card is shown;
                  email and phone stay private until a separate exchange is accepted.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-secondary sm:justify-start">
                <span className="rounded-full border border-subtle bg-surface-dark/60 px-3 py-1.5">Opt in to appear</span>
                <span className="rounded-full border border-subtle bg-surface-dark/60 px-3 py-1.5">Accept before connecting</span>
                <span className="rounded-full border border-subtle bg-surface-dark/60 px-3 py-1.5">Choose what to share</span>
              </div>
              <p className="text-xs text-tertiary">
                Keep this page open while you connect. Visibility expires automatically when your session ends.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-success/30 bg-success-soft/20 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              Visible as @{ownCard?.username || user?.username}
            </div>
            <span className="text-xs text-secondary">
              {lastUpdated ? `Last checked ${lastUpdated.toLocaleTimeString()}` : "Checking for members…"}
            </span>
          </div>

          {incoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-secondary">Connection invitations</h3>
              {incoming.map((exchange) => (
                <MemberCard key={exchange.id} card={exchange.peer} detail="wants to connect using WebRTC">
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => respond(exchange.id, "accept")}
                      disabled={Boolean(busyExchange)}
                      aria-label={`Accept connection from ${exchange.peer.name}`}
                      className="rounded-lg bg-success-soft p-2 text-success disabled:opacity-50"
                    >
                      {busyExchange === exchange.id ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiCheck className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(exchange.id, "reject")}
                      disabled={Boolean(busyExchange)}
                      aria-label={`Decline connection from ${exchange.peer.name}`}
                      className="rounded-lg bg-danger-soft p-2 text-danger disabled:opacity-50"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </MemberCard>
              ))}
            </div>
          )}

          {activeExchange && (
            <MemberCard
              card={activeExchange.peer}
              detail={connectedPeer
                ? "Encrypted peer-to-peer data channel connected"
                : activeExchange.status === "connected"
                  ? "Verifying peer identity over the data channel…"
                  : "Invitation accepted · establishing peer connection"}
            >
              {connectedPeer && (
                <Button
                  onClick={() => onRequestExchange?.(connectedPeer)}
                  size="sm"
                  variant="glow"
                  icon={FiUserPlus}
                  className="shrink-0"
                >
                  Request exchange
                </Button>
              )}
              <button
                type="button"
                onClick={() => respond(activeExchange.id, "close")}
                disabled={Boolean(busyExchange)}
                aria-label="Disconnect peer"
                className="rounded-lg border border-subtle p-2 text-secondary hover:text-danger disabled:opacity-50"
              >
                <FiX className="h-4 w-4" />
              </button>
            </MemberCard>
          )}

          {outgoing.map((exchange) => (
            <MemberCard key={exchange.id} card={exchange.peer} detail="Invitation sent · waiting for consent">
              <button
                type="button"
                onClick={() => respond(exchange.id, "close")}
                disabled={Boolean(busyExchange)}
                className="shrink-0 rounded-lg border border-subtle px-3 py-2 text-xs font-semibold text-secondary hover:text-danger"
              >
                Cancel
              </button>
            </MemberCard>
          ))}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-secondary">Available OneMe members</h3>
              <span className="text-xs text-tertiary">{peers.length} online</span>
            </div>
            {peers.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {peers.map((peer) => (
                  <MemberCard key={peer.sessionId} card={peer.card}>
                    <Button
                      onClick={() => invite(peer.sessionId)}
                      disabled={Boolean(activeExchange) || Boolean(outgoing.length) || Boolean(busyExchange)}
                      size="sm"
                      variant="outline"
                      icon={FiUserPlus}
                    >
                      {busyExchange === peer.sessionId ? "Sending…" : "Connect"}
                    </Button>
                  </MemberCard>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-subtle p-4 text-center text-sm text-secondary">
                No other opted-in members are available right now. Keep this page open or try the username and QR options.
              </div>
            )}
          </div>
        </div>
      )}

      {message && (
        <p role="status" className="rounded-xl border border-subtle bg-surface-dark/50 px-3 py-2 text-sm text-secondary">
          {message}
        </p>
      )}
    </section>
  );
}
