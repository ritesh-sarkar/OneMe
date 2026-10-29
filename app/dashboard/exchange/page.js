'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiRadio,
  FiGrid,
  FiZap,
  FiUserCheck,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { RadarScan } from '@/components/exchange/RadarScan';
import { PeerCard } from '@/components/exchange/PeerCard';
import { QrGenerator } from '@/components/qr/QrGenerator';
import { ExchangeModal } from '@/components/exchange/ExchangeModal';
import { useProfile } from '@/context/ProfileContext';

const DEMO_NEARBY = [
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
    notes: 'Exchanged at OneMe Live Radar Meetup.',
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

export default function ExchangeStudioPage() {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'qr'
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const exchangeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/exchange?token=flow_${Date.now()}&from=${profile?.username || 'ritesh'}`
    : `https://oneme.app/exchange?token=flow_demo`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            OneMe Flow Protocol
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Proximity radar discovery and dynamic mutual contact exchange session generator.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          variant="glow"
          size="md"
          icon={FiZap}
        >
          Launch OneMe Flow
        </Button>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-glass border border-subtle max-w-sm">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'radar'
              ? 'bg-cyan text-surface-dark font-bold shadow-md'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <FiRadio className="w-3.5 h-3.5" />
          <span>OneMe Flow Radar</span>
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'qr'
              ? 'bg-cyan text-surface-dark font-bold shadow-md'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <FiGrid className="w-3.5 h-3.5" />
          <span>Exchange QR Code</span>
        </button>
      </div>

      {/* Main Studio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
          {activeTab === 'radar' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <span className="text-xs font-mono text-cyan flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                  OneMe Flow Radar Active (4 peers nearby)
                </span>
                <span className="text-xs text-muted font-mono">Range ~10m</span>
              </div>

              <RadarScan
                isSearching={true}
                peers={DEMO_NEARBY}
                selectedPeer={selectedPeer}
                onSelectPeer={(p) => {
                  setSelectedPeer(p);
                  setModalOpen(true);
                }}
              />

              <p className="text-xs text-center text-secondary leading-relaxed max-w-md mx-auto">
                Click on any nearby avatar or tap <strong>Launch OneMe Flow</strong> to experience the mutual handshake simulation.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <QrGenerator
                url={exchangeUrl}
                username={profile?.username || 'ritesh'}
                title="Dynamic OneMe Flow QR"
              />
              <p className="text-xs text-center text-secondary leading-relaxed max-w-md mx-auto">
                This dynamic code creates a private 1-to-1 session token. When scanned, both devices receive instant mutual permission prompts.
              </p>
            </div>
          )}
        </div>

        {/* Right: Discovered Peers List */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-subtle pb-3">
            <h3 className="text-sm font-bold text-primary">Nearby Discovered Peers</h3>
            <span className="text-xs text-cyan font-mono font-bold">4 Online</span>
          </div>

          <div className="space-y-2.5">
            {DEMO_NEARBY.map((peer) => (
              <PeerCard
                key={peer.id}
                peer={peer}
                isSelected={selectedPeer?.id === peer.id}
                onSelect={(p) => {
                  setSelectedPeer(p);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <ExchangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={profile}
      />
    </div>
  );
}
