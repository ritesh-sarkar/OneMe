'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiSearch,
  FiDownload,
  FiMail,
  FiPhone,
  FiTrash2,
  FiExternalLink,
  FiRadio,
  FiRefreshCw,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useConnections } from '@/context/ConnectionsContext';
import { useToast } from '@/context/ToastContext';
import { downloadVCard } from '@/lib/vcard';
import { formatDate } from '@/lib/utils';
import { ExchangeModal } from '@/components/exchange/ExchangeModal';
import { useProfile } from '@/context/ProfileContext';

export default function ConnectionsPage() {
  const { connections, removeConnection, resetConnections } = useConnections();
  const { profile } = useProfile();
  const { success, info } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeOpen, setExchangeOpen] = useState(false);

  const filteredConnections = connections.filter((conn) => {
    const q = searchQuery.toLowerCase();
    return (
      conn.name?.toLowerCase().includes(q) ||
      conn.title?.toLowerCase().includes(q) ||
      conn.company?.toLowerCase().includes(q) ||
      conn.location?.toLowerCase().includes(q)
    );
  });

  const handleExportSingle = (conn) => {
    downloadVCard(conn);
    success(`Downloaded vCard for ${conn.name}!`);
  };

  const handleExportAll = () => {
    const bulkVcards = connections
      .map((conn) => {
        return `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${conn.name}\r\nTITLE:${conn.title || ''}\r\nORG:${conn.company || ''}\r\nEMAIL:${conn.email || ''}\r\nTEL:${conn.phone || ''}\r\nNOTE:OneMe Flow Connection\r\nEND:VCARD`;
      })
      .join('\r\n\r\n');

    const blob = new Blob([bulkVcards], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `oneme_all_connections.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Exported ${connections.length} contacts to bulk vCard file!`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            My Connections
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Contacts saved via OneMe Flow radar, QR scanning, and profile shares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setExchangeOpen(true)}
            variant="glow"
            size="sm"
            icon={FiRadio}
          >
            OneMe Flow Radar
          </Button>

          {connections.length > 0 && (
            <Button
              onClick={handleExportAll}
              variant="outline"
              size="sm"
              icon={FiDownload}
            >
              Export All (.vcf)
            </Button>
          )}

          <Button
            onClick={() => {
              resetConnections();
              success('Connections reset to demo list.');
            }}
            variant="outline"
            size="sm"
            icon={FiRefreshCw}
            title="Reset to Demo Contacts"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name, company, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={FiSearch}
        />
      </div>

      {/* Connections List */}
      {filteredConnections.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-glass-soft border border-subtle space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-panel text-secondary flex items-center justify-center mx-auto">
            <FiUsers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-primary">No connections found</h3>
            <p className="text-xs text-secondary">
              Try searching with a different keyword or start a OneMe Flow exchange.
            </p>
          </div>
          <Button onClick={() => setExchangeOpen(true)} variant="primary" size="sm" icon={FiRadio}>
            Open OneMe Flow Radar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredConnections.map((conn) => (
            <motion.div
              key={conn.id}
              whileHover={{ y: -2 }}
              className="p-5 rounded-3xl bg-glass border border-subtle backdrop-blur-xl hover:border-light transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-light shrink-0">
                    <img
                      src={conn.avatar}
                      alt={conn.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">{conn.name}</h3>
                    <p className="text-xs text-cyan font-medium">{conn.title}</p>
                    <p className="text-[11px] text-secondary">{conn.company}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeConnection(conn.id);
                    info(`Removed ${conn.name} from connections.`);
                  }}
                  className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                  title="Remove Connection"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Contact Information info box */}
              <div className="p-3 rounded-2xl bg-surface-dark/70 border border-subtle space-y-1.5 text-xs text-secondary">
                {conn.email && (
                  <div className="flex items-center gap-2 truncate">
                    <FiMail className="w-3.5 h-3.5 text-cyan shrink-0" />
                    <span className="truncate">{conn.email}</span>
                  </div>
                )}
                {conn.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-3.5 h-3.5 text-success shrink-0" />
                    <span className="font-mono text-[11px]">{conn.phone}</span>
                  </div>
                )}
                {conn.exchangeMethod && (
                  <div className="text-[10px] text-muted pt-1 border-t border-subtle font-mono flex items-center justify-between">
                    <span>Via {conn.exchangeMethod}</span>
                    <span>{formatDate(conn.dateConnected)}</span>
                  </div>
                )}
              </div>

              {/* Card Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleExportSingle(conn)}
                  variant="primary"
                  size="sm"
                  icon={FiDownload}
                  className="flex-1 text-xs"
                >
                  Save .vcf
                </Button>
                <Link
                  href={`/@${conn.username || 'user'}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-surface-dark hover:bg-surface-panel text-secondary hover:text-primary transition-colors"
                  title="View OneMe Profile"
                >
                  <FiExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* OneMe Flow Exchange Modal */}
      <ExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        currentUser={profile}
      />
    </div>
  );
}
