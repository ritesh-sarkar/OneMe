'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { QrGenerator } from './QrGenerator';

export function QrShareModal({ isOpen, onClose, user }) {
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${user?.username || 'ritesh'}`
    : `https://oneme.app/@${user?.username || 'ritesh'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Identity QR Code"
      description="Scan with any phone camera to instantly view and save this OneMe profile"
      maxWidth="max-w-md"
    >
      <div className="py-2">
        <QrGenerator
          url={profileUrl}
          username={user?.username || 'ritesh'}
          title={`${user?.name || 'Ritesh Sarkar'}'s OneMe QR`}
        />
      </div>
    </Modal>
  );
}
