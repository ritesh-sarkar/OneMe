'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  FiRadio,
  FiGrid,
  FiZap,
  FiCheckCircle,
  FiUserCheck,
  FiShield,
  FiArrowRight,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiShare2,
} from 'react-icons/fi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { RadarScan } from './RadarScan';
import { PeerCard } from './PeerCard';
import { QrGenerator } from '@/components/qr/QrGenerator';
import { useConnections } from '@/context/ConnectionsContext';
import { useToast } from '@/context/ToastContext';

const NEARBY_PEERS = [
  {
    id: 'peer_1',
    name: 'Sarah Khan',
    username: 'sarahk',
    title: 'Lead Product Designer',
    company: 'Starlight Studio',
    location: 'Singapore',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    email: 'sarah@starlight.design',
    phone: '+65 9123 4567',
    notes: 'Exchanged at OneMe Flow Meetup.',
  },
  {
    id: 'peer_2',
    name: 'John Doe',
    username: 'johndoe',
    title: 'Senior Software Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    email: 'john.doe@stripe.dev',
    phone: '+1 (415) 880-9214',
    notes: 'Exchanged via OneMe Flow Web Radar.',
  },
  {
    id: 'peer_3',
    name: 'Alex Rivera',
    username: 'alexrivera',
    title: 'Founder & CTO',
    company: 'HyperScale AI',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    email: 'alex@hyperscale.ai',
    phone: '+1 (512) 640-1129',
    notes: 'Exchanged at AI Meetup via OneMe Flow.',
  },
  {
    id: 'peer_4',
    name: 'Maya Patel',
    username: 'mayapatel',
    title: 'Developer Relations Engineer',
    company: 'Vercel',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    email: 'maya@vercel.dev',
    phone: '+44 7700 900341',
    notes: 'Connected via OneMe Flow Radar.',
  },
];

export function ExchangeModal({ isOpen, onClose, currentUser }) {
  const [activeMode, setActiveMode] = useState('radar'); // 'radar' | 'qr'
  const [step, setStep] = useState('discover'); // 'discover' | 'requesting' | 'permissions' | 'success'
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [shareEmail, setShareEmail] = useState(true);
  const [sharePhone, setSharePhone] = useState(true);
  const [shareSocials, setShareSocials] = useState(true);
  const [shareResume, setShareResume] = useState(false);

  const { addConnection } = useConnections();
  const { success } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep('discover');
      setSelectedPeer(null);
    }
  }, [isOpen]);

  const handlePeerSelect = (peer) => {
    setSelectedPeer(peer);
  };

  const handleSendRequest = () => {
    if (!selectedPeer) return;
    setStep('requesting');
    setTimeout(() => {
      setStep('permissions');
    }, 1100);
  };

  const handleConfirmExchange = () => {
    if (!selectedPeer) return;

    addConnection(selectedPeer, activeMode === 'radar' ? 'OneMe Flow Radar' : 'QR Scan');

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#fe019a', '#10b981', '#a3e635'],
      });
    } catch (e) {
      // safe fallback
    }

    setStep('success');
    success(`Connected with ${selectedPeer.name}! Added to My Connections.`);
  };

  const exchangeQrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/exchange?token=flow_${Date.now()}&from=${currentUser?.username || 'ritesh'}`
    : `https://oneme.app/exchange?token=flow_demo`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OneMe Flow — Contact Protocol"
      description="Instant mutual digital contact exchange without typing phone numbers or swapping visiting cards"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 py-2">
        {/* Mode Selector */}
        {step === 'discover' && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-dark border border-subtle">
            <button
              onClick={() => setActiveMode('radar')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'radar'
                  ? 'bg-cyan text-surface-dark shadow-md font-bold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <FiRadio className="w-3.5 h-3.5" />
              <span>OneMe Flow Radar</span>
            </button>
            <button
              onClick={() => setActiveMode('qr')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'qr'
                  ? 'bg-cyan text-surface-dark shadow-md font-bold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <FiGrid className="w-3.5 h-3.5" />
              <span>Exchange QR Code</span>
            </button>
          </div>
        )}

        {/* Step: Discover with Radar or QR */}
        {step === 'discover' && activeMode === 'radar' && (
          <div className="space-y-4">
            <RadarScan
              isSearching={true}
              peers={NEARBY_PEERS}
              selectedPeer={selectedPeer}
              onSelectPeer={handlePeerSelect}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-secondary px-1">
                <span>Nearby OneMe Members ({NEARBY_PEERS.length})</span>
                <span className="font-mono text-success">● 4 Online</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {NEARBY_PEERS.map((peer) => (
                  <PeerCard
                    key={peer.id}
                    peer={peer}
                    isSelected={selectedPeer?.id === peer.id}
                    onSelect={handlePeerSelect}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleSendRequest}
              disabled={!selectedPeer}
              variant="glow"
              size="lg"
              className="w-full justify-center"
              icon={FiZap}
            >
              {selectedPeer
                ? `Initiate Flow with ${selectedPeer.name.split(' ')[0]}`
                : 'Select a nearby peer to connect'}
            </Button>
          </div>
        )}

        {step === 'discover' && activeMode === 'qr' && (
          <div className="space-y-4">
            <QrGenerator
              url={exchangeQrUrl}
              username={currentUser?.username || 'ritesh'}
              title="Scan to Exchange OneMe Identity"
            />
            <p className="text-xs text-center text-secondary leading-relaxed">
              When another person scans this dynamic exchange code, you will both receive an instant mutual exchange prompt.
            </p>
          </div>
        )}

        {/* Step: Requesting handshake */}
        {step === 'requesting' && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-cyan-soft text-cyan border-2 border-cyan animate-pulse">
              <FiZap className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-primary">
                Connecting with {selectedPeer?.name}...
              </h4>
              <p className="text-xs text-secondary">
                Sending encrypted OneMe Flow handshake invitation to {selectedPeer?.title}
              </p>
            </div>
          </div>
        )}

        {/* Step: Choose Info to Share */}
        {step === 'permissions' && selectedPeer && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success-soft border border-light text-success text-xs">
              <FiUserCheck className="w-5 h-5 shrink-0" />
              <span>
                <strong>{selectedPeer.name}</strong> accepted your Flow request! Choose what details you wish to exchange:
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-dark border border-subtle space-y-3.5">
              <h5 className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Select Shared Information
              </h5>
              <Toggle
                label="Share Email Address"
                description={currentUser?.email || 'ritesh@sarkar.dev'}
                checked={shareEmail}
                onChange={setShareEmail}
              />
              <Toggle
                label="Share Phone Number"
                description={currentUser?.phone || '+880 1712-345678'}
                checked={sharePhone}
                onChange={setSharePhone}
              />
              <Toggle
                label="Share Social Profiles"
                description="GitHub, LinkedIn, Twitter, WhatsApp"
                checked={shareSocials}
                onChange={setShareSocials}
              />
              <Toggle
                label="Attach PDF Resume"
                description="Include verified curriculum vitae"
                checked={shareResume}
                onChange={setShareResume}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setStep('discover')}
                variant="outline"
                size="md"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmExchange}
                variant="glow"
                size="md"
                className="flex-1"
                icon={FiCheckCircle}
              >
                Confirm Exchange
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success Animation */}
        {step === 'success' && selectedPeer && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 rounded-full bg-success text-surface-dark flex items-center justify-center glow-emerald"
            >
              <FiCheckCircle className="w-8 h-8" />
            </motion.div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-primary">
                OneMe Flow Exchange Complete!
              </h4>
              <p className="text-xs text-secondary max-w-sm">
                You and <strong>{selectedPeer.name}</strong> now have each other’s verified digital contact card saved.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-dark border border-subtle w-full text-left flex items-center gap-3.5">
              <img
                src={selectedPeer.avatar}
                alt={selectedPeer.name}
                className="w-12 h-12 rounded-full object-cover border border-light"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-primary truncate">{selectedPeer.name}</div>
                <div className="text-xs text-secondary truncate">{selectedPeer.email}</div>
                <div className="text-xs text-cyan font-mono mt-0.5">{selectedPeer.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <Button
                onClick={() => {
                  setStep('discover');
                  setSelectedPeer(null);
                }}
                variant="outline"
                size="md"
                className="flex-1"
                icon={FiRefreshCw}
              >
                Flow Another
              </Button>
              <Button
                onClick={onClose}
                variant="primary"
                size="md"
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
