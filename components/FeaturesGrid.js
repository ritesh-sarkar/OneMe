'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiRadio,
  FiDownload,
  FiSliders,
  FiBarChart2,
  FiCpu,
  FiUploadCloud,
} from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiRadio,
    title: 'OneMe Flow Protocol',
    description: 'Mutual proximity radar exchange that lets two devices connect and save each other without typing.',
    tag: 'Signature Feature',
    color: 'text-cyan',
  },
  {
    icon: FiDownload,
    title: 'Instant vCard (.vcf) Generator',
    description: 'Generates client-side RFC 6350 contacts ready to be imported directly into iOS Contacts or Android Address Books.',
    tag: 'Works Offline',
    color: 'text-success',
  },
  {
    icon: FiSliders,
    title: 'Theme & Token Studio',
    description: '8 brand-new curated styles including Neo-Tokyo Cyberpunk, Arctic Slate, and Retro Synthwave with custom CSS tokens.',
    tag: 'Live Sync',
    color: 'text-accent',
  },
  {
    icon: FiBarChart2,
    title: 'Telemetry & Analytics Suite',
    description: 'Real-time interactive views, QR scans, referral origins, country distribution, and link click tracking.',
    tag: 'Full Privacy',
    color: 'text-warning',
  },
  {
    icon: FiCpu,
    title: 'AI Profile Assistant',
    description: 'Simulated AI generative engine crafting high-conversion taglines, bios, and CTAs tailored to your industry.',
    tag: 'Built-In',
    color: 'text-accent',
  },
  {
    icon: FiUploadCloud,
    title: 'Media & Asset Manager',
    description: 'Direct browser-side file upload for high-res avatar photos, banners, and project media with instant rendering.',
    tag: 'Instant Upload',
    color: 'text-accent',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Everything You Need in One Link
          </h2>
          <p className="text-sm sm:text-base text-secondary">
            Engineered for developers, creators, founders, and designers who demand a standout personal digital presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-subtle bg-surface-deep/50 hover:bg-surface-panel/60 hover:border-light transition-all duration-300 backdrop-blur-md group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-glass-soft ${feature.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-glass-soft text-secondary border border-subtle font-mono">
                      {feature.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-primary group-hover:text-cyan transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary mt-2 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
