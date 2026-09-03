'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiMapPin, FiBriefcase, FiChevronRight } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';

export function PeerCard({ peer, isSelected, onSelect }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(peer)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? 'bg-accent-soft border-accent shadow-md glow-indigo'
          : 'bg-glass hover:bg-surface-panel/80 border-subtle'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-light">
          <img
            src={peer.avatar}
            alt={peer.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border border-subtle" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-primary truncate">{peer.name}</h4>
            <span className="text-[11px] text-secondary font-mono">@{peer.username}</span>
          </div>
          <p className="text-xs text-secondary truncate">{peer.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
            {peer.company && <span>{peer.company}</span>}
            {peer.location && (
              <>
                <span>•</span>
                <span>{peer.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        {isSelected ? (
          <div className="p-1.5 rounded-full bg-accent text-primary">
            <FiCheckCircle className="w-4 h-4" />
          </div>
        ) : (
          <div className="p-1.5 text-muted">
            <FiChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
