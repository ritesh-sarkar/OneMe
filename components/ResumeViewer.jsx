'use client';

import React from 'react';
import { FiFileText, FiDownload, FiEye, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/Button';
import { useToast } from '@/context/ToastContext';

export function ResumeViewer({ resume, user, cardClass = '' }) {
  const { success } = useToast();
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Create a mock downloadable resume text/html representation
      const content = `=====================================================
${(user?.name || 'RITESH SARKAR').toUpperCase()} — CURRICULUM VITAE
${user?.title || 'Full-Stack Developer'} | ${user?.location || 'Dhaka, Bangladesh'}
Email: ${user?.email || 'ritesh@sarkar.dev'} | Phone: ${user?.phone || '+880 1712-345678'}
OneMe Profile: https://oneme.app/@${user?.username || 'ritesh'}
=====================================================

EXECUTIVE SUMMARY:
${resume?.summary || 'Experienced Full-Stack Developer specialized in Next.js, React, Node.js, and modern distributed web architectures.'}

SKILLS:
JavaScript (ESNext), React, Next.js, Node.js, Tailwind CSS, Express, MongoDB, REST APIs, Git, Docker, System Design.

EDUCATION:
Bachelor of Science in Computer Science & Engineering
Daffodil International University | CGPA: 3.85 / 4.00

EXPERIENCE:
1. Lead Frontend Engineer — Vanguard Digital Solutions (2023 — Present)
2. Full-Stack Developer — Apex CodeCraft Lab (2021 — 2023)

CERTIFICATIONS:
- Meta Front-End Developer Professional Certificate (Coursera)
- AWS Certified Cloud Practitioner (Amazon Web Services)
=====================================================`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${(user?.name || 'Ritesh_Sarkar').replace(/\s+/g, '_')}_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setDownloading(false);
      success('Resume file downloaded successfully!', 'Resume Downloaded');
    }, 600);
  };

  if (!resume) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Professional Resume
      </h3>

      <div className={`p-5 rounded-2xl border border-subtle bg-glass backdrop-blur-md ${cardClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-accent-soft text-accent shrink-0">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary">
                {resume.fileName || `${user?.name || 'User'}_Resume.pdf`}
              </h4>
              <div className="flex items-center gap-2 text-xs text-secondary mt-0.5 font-mono">
                <span>{resume.fileSize || '1.4 MB'}</span>
                <span>•</span>
                <span>Updated {resume.updatedAt || 'Recent'}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            isLoading={downloading}
            variant="outline"
            size="sm"
            icon={FiDownload}
            className="hover:border-accent/40 shrink-0"
          >
            Download Resume
          </Button>
        </div>

        {resume.summary && (
          <div className="mt-4 pt-3 border-t border-subtle">
            <p className="text-xs text-secondary leading-relaxed italic">
              &ldquo;{resume.summary}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
