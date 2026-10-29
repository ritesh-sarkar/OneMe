'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiSettings,
  FiShield,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiGlobe,
  FiRefreshCw,
  FiLogOut,
  FiGithub,
  FiLinkedin,
  FiBookOpen,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { profile, updateProfile, resetToDemo } = useProfile();
  const { logout } = useAuth();
  const { success, info } = useToast();

  const privacy = profile?.privacy || {
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showResume: true,
    searchEngineIndexing: true,
    allowContactExchange: true,
  };

  const handlePrivacyToggle = (key, value) => {
    updateProfile({
      privacy: {
        ...privacy,
        [key]: value,
      },
    });
    success(`Privacy preference updated.`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Manage your identity privacy, search visibility, and verified credentials.
        </p>
      </div>

      {/* Privacy Controls Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-subtle pb-4">
          <div className="p-2 rounded-xl bg-accent-soft text-accent">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">Profile Field Privacy</h3>
            <p className="text-xs text-secondary">
              Control which sensitive fields are visible on your public OneMe link.
            </p>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-zinc-800/60">
          <div className="pt-2">
            <Toggle
              label="Public Email Address"
              description="Allow visitors to email you directly from your profile"
              checked={privacy.showEmail !== false}
              onChange={(v) => handlePrivacyToggle('showEmail', v)}
            />
          </div>

          <div className="pt-4">
            <Toggle
              label="Public Phone Number"
              description="Display phone number on contact card and vCard downloads"
              checked={privacy.showPhone !== false}
              onChange={(v) => handlePrivacyToggle('showPhone', v)}
            />
          </div>

          <div className="pt-4">
            <Toggle
              label="Public Location"
              description="Show city and country badge (e.g. Dhaka, Bangladesh)"
              checked={privacy.showLocation !== false}
              onChange={(v) => handlePrivacyToggle('showLocation', v)}
            />
          </div>

          <div className="pt-4">
            <Toggle
              label="Public Resume Download"
              description="Allow visitors to download your attached CV file"
              checked={privacy.showResume !== false}
              onChange={(v) => handlePrivacyToggle('showResume', v)}
            />
          </div>

          <div className="pt-4">
            <Toggle
              label="OneMe Flow Radar Discovery"
              description="Permit nearby OneMe members to discover your device in contact exchanges"
              checked={privacy.allowContactExchange !== false}
              onChange={(v) => handlePrivacyToggle('allowContactExchange', v)}
            />
          </div>
        </div>
      </div>

      {/* Verification & Trust Badges */}
      <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-subtle pb-4">
          <div className="p-2 rounded-xl bg-success-soft text-success">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">Verified Identity Badges</h3>
            <p className="text-xs text-secondary">
              Proof-of-identity credentials displayed on your public profile.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-dark/70 border border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-soft text-accent">
                <FiCheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary">Email Verified</div>
                <div className="text-[10px] text-secondary font-mono">{profile.email}</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-success px-2 py-0.5 rounded-full bg-success-soft border border-light">
              Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-dark/70 border border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-glass-soft text-secondary">
                <FiGithub className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary">GitHub Connected</div>
                <div className="text-[10px] text-secondary font-mono">@riteshsarkar</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-success px-2 py-0.5 rounded-full bg-success-soft border border-light">
              Verified
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-dark/70 border border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-soft text-cyan">
                <FiLinkedin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary">LinkedIn Connected</div>
                <div className="text-[10px] text-secondary font-mono">in/riteshsarkar</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-success px-2 py-0.5 rounded-full bg-success-soft border border-light">
              Verified
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-dark/70 border border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-warning-soft text-warning">
                <FiBookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary">University Affiliation</div>
                <div className="text-[10px] text-secondary">Daffodil Int. University</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-success px-2 py-0.5 rounded-full bg-success-soft border border-light">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-primary border-b border-subtle pb-3">
          Account Administration
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary">Reset Local Prototype Data</div>
            <div className="text-[11px] text-secondary">Revert all profile changes back to default demo state</div>
          </div>
          <Button
            onClick={() => {
              resetToDemo();
              success('Profile reset to original demo state.');
            }}
            variant="outline"
            size="sm"
            icon={FiRefreshCw}
          >
            Reset to Demo
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-subtle">
          <div>
            <div className="text-xs font-bold text-danger">Sign Out of OneMe</div>
            <div className="text-[11px] text-secondary">Clear active demo session</div>
          </div>
          <Button
            onClick={logout}
            variant="danger"
            size="sm"
            icon={FiLogOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
