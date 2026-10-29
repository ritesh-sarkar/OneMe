'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiCreditCard,
  FiMail,
  FiCopy,
  FiCheck,
  FiDownload,
  FiRepeat,
  FiGlobe,
  FiPhone,
  FiGithub,
  FiLinkedin,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { QrGenerator } from '@/components/qr/QrGenerator';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/context/ToastContext';
import { copyToClipboard } from '@/lib/utils';

const TOOL_TABS = [
  { id: 'card', label: 'Digital Business Card', icon: FiCreditCard },
  { id: 'signature', label: 'Email Signature Builder', icon: FiMail },
];

export default function ToolsPage() {
  const { profile } = useProfile();
  const { success } = useToast();

  const [activeTool, setActiveTool] = useState('card');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [sigStyle, setSigStyle] = useState('modern'); // 'modern' | 'minimal' | 'executive'
  const [sigCopied, setSigCopied] = useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${profile?.username || 'ritesh'}`
    : `https://oneme.app/@${profile?.username || 'ritesh'}`;

  // Generate Email Signature HTML
  const generateSignatureHtml = () => {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #333333; line-height: 1.4;">
  <tr>
    <td style="padding-right: 16px; vertical-align: top;">
      <img src="${profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}" alt="${profile?.name}" width="70" height="70" style="border-radius: 50%; display: block; object-fit: cover;" />
    </td>
    <td style="border-left: 2px solid #6366f1; padding-left: 16px; vertical-align: top;">
      <div style="font-size: 16px; font-weight: bold; color: #111827;">${profile?.name || 'Ritesh Sarkar'}</div>
      <div style="font-size: 13px; color: #6366f1; font-weight: 600; margin-top: 2px;">${profile?.title || 'Full-Stack Developer'}</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">📍 ${profile?.location || 'Dhaka, Bangladesh'}</div>
      <div style="margin-top: 8px; font-size: 12px;">
        <span style="color: #4b5563;">✉️ ${profile?.email || 'ritesh@sarkar.dev'}</span> &nbsp;|&nbsp;
        <span style="color: #4b5563;">📞 ${profile?.phone || '+880 1712-345678'}</span>
      </div>
      <div style="margin-top: 6px; font-size: 12px;">
        <a href="${profileUrl}" style="color: #6366f1; text-decoration: none; font-weight: bold;">⚡ OneMe: ${profileUrl}</a>
      </div>
    </td>
  </tr>
</table>`;
  };

  const handleCopySignature = () => {
    const html = generateSignatureHtml();
    copyToClipboard(html);
    setSigCopied(true);
    success('HTML Email signature copied to clipboard! Paste directly into Gmail/Outlook.');
    setTimeout(() => setSigCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Digital Identity Tools
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Generate shareable business cards and copyable HTML email signatures.
          </p>
        </div>

        <Tabs
          tabs={TOOL_TABS}
          activeTab={activeTool}
          onChange={setActiveTool}
        />
      </div>

      {/* Tool: Digital Business Card */}
      {activeTool === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Card Preview Stage */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-2xl space-y-6">
            <div
              onClick={() => setCardFlipped(!cardFlipped)}
              className="w-full max-w-md aspect-[1.75/1] rounded-3xl p-6 sm:p-8 cursor-pointer relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-light transition-all duration-500 overflow-hidden group select-none"
              style={{
                background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
              }}
            >
              {/* Subtle NFC / Metallic Chip Graphic */}
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-muted">ONE ME NFC</span>
                <div className="w-6 h-5 rounded bg-warning-soft border border-light flex items-center justify-center">
                  <div className="w-3 h-2 border-t border-b border-light" />
                </div>
              </div>

              {!cardFlipped ? (
                /* Card Front */
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={profile?.avatar}
                      alt={profile?.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-accent/40"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-primary tracking-tight">{profile?.name}</h3>
                      <p className="text-xs text-accent font-medium">{profile?.title}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-secondary font-mono">@{profile?.username}</div>
                    <div className="text-[11px] text-muted font-mono flex items-center justify-between">
                      <span>{profile?.email}</span>
                      <span className="text-accent">Tap to flip →</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Back */
                <div className="h-full flex items-center justify-between gap-4">
                  <div className="space-y-2 max-w-[60%]">
                    <div className="text-xs font-bold text-primary">Scan to Connect</div>
                    <p className="text-[11px] text-secondary leading-snug">
                      Tap NFC or scan QR code to view live OneMe profile and download contact card.
                    </p>
                    <div className="text-[10px] text-accent font-mono pt-1">
                      oneme.app/@{profile?.username}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                    <div className="w-20 h-20 bg-surface-dark rounded flex items-center justify-center text-primary text-[10px] font-mono">
                      QR Code
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-secondary flex items-center gap-1.5 font-mono">
              <FiRepeat className="w-3.5 h-3.5 text-accent" />
              <span>Click card to preview front/back view</span>
            </p>
          </div>

          {/* Card Info & Download */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-6">
            <h3 className="text-base font-bold text-primary">Digital Business Card</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Your digital business card represents your professional brand at in-person conferences, coffee chats, and client meetings.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => setCardFlipped(!cardFlipped)}
                variant="outline"
                size="md"
                className="w-full justify-center"
                icon={FiRepeat}
              >
                Flip Digital Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tool: Email Signature Builder */}
      {activeTool === 'signature' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Live Signature Stage */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="text-sm font-bold text-primary border-b border-subtle pb-3">
              Live Signature Preview
            </h3>

            {/* Email client preview mock */}
            <div className="p-6 rounded-2xl bg-white text-surface-dark shadow-xl border border-light space-y-4">
              <div className="text-xs text-secondary font-mono pb-2 border-b border-subtle">
                To: client@company.com • Subject: Project Follow-up
              </div>

              <div
                dangerouslySetInnerHTML={{ __html: generateSignatureHtml() }}
                className="select-all"
              />
            </div>

            <Button
              onClick={handleCopySignature}
              variant="glow"
              size="lg"
              className="w-full justify-center"
              icon={sigCopied ? FiCheck : FiCopy}
            >
              {sigCopied ? 'HTML Signature Copied!' : 'Copy HTML Signature'}
            </Button>
          </div>

          {/* Signature Instructions */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-5">
            <h3 className="text-base font-bold text-primary">How to Install</h3>
            <ol className="space-y-3 text-xs text-secondary list-decimal list-inside leading-relaxed">
              <li>Click <strong>Copy HTML Signature</strong> button.</li>
              <li>Open your email client settings (Gmail, Outlook, Apple Mail).</li>
              <li>Navigate to the <strong>Signatures</strong> section.</li>
              <li>Paste (Ctrl+V / Cmd+V) directly into the signature composer.</li>
              <li>Save changes. Your emails now feature your verified OneMe identity!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
