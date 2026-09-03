'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiRadio, FiUserCheck, FiZap } from 'react-icons/fi';

export function RadarScan({ isSearching = true, peers = [], onSelectPeer, selectedPeer = null }) {
  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center p-4">
      {/* Outer Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full rounded-full border border-accent/10 animate-ping opacity-20" />
        <div className="w-3/4 h-3/4 rounded-full border border-accent/20 animate-pulse-slow" />
        <div className="w-1/2 h-1/2 rounded-full border border-light" />
        <div className="w-1/4 h-1/4 rounded-full border border-accent/40" />

        {/* Sweeping Radar Beam */}
        {isSearching && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(99, 102, 241, 0.3) 100%)',
            }}
          />
        )}
      </div>

      {/* Center Device Icon */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr gradient-brand flex items-center justify-center text-primary shadow-[0_0_30px_rgba(99,102,241,0.6)] border-2 border-white/20">
        <FiRadio className="w-7 h-7 animate-pulse" />
        <span className="absolute -bottom-6 whitespace-nowrap text-[11px] font-mono text-accent">
          {isSearching ? 'Scanning nearby...' : 'Radar Ready'}
        </span>
      </div>

      {/* Floating Discovered Peers Around Radar */}
      {peers.map((peer, index) => {
        // Compute circular coordinates
        const angle = (index * (360 / peers.length) * Math.PI) / 180;
        const radius = 110; // pixels from center
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isSelected = selectedPeer?.id === peer.id;

        return (
          <motion.button
            key={peer.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x, y }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: index * 0.2 }}
            onClick={() => onSelectPeer(peer)}
            className={`absolute z-20 flex flex-col items-center group focus:outline-none`}
            title={`Connect with ${peer.name}`}
          >
            <div
              className={`relative w-12 h-12 rounded-full p-0.5 border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-success scale-110 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                  : 'border-white/30 group-hover:border-accent group-hover:scale-105'
              }`}
            >
              <img
                src={peer.avatar}
                alt={peer.name}
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border border-subtle" />
            </div>
            <span
              className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap backdrop-blur-md transition-colors ${
                isSelected
                  ? 'bg-success text-surface-dark font-bold'
                  : 'bg-surface-deep text-primary border border-light group-hover:bg-accent group-hover:text-primary'
              }`}
            >
              {peer.name.split(' ')[0]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
