'use client';

import React, { useState } from 'react';
import {
  FiFileText,
  FiBriefcase,
  FiBookOpen,
  FiAward,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiCheck,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/context/ToastContext';

const RESUME_TABS = [
  { id: 'experience', label: 'Experience', icon: FiBriefcase },
  { id: 'education', label: 'Education', icon: FiBookOpen },
  { id: 'certifications', label: 'Certifications', icon: FiAward },
  { id: 'achievements', label: 'Achievements', icon: FiAward },
];

export default function ResumePage() {
  const {
    profile,
    experience,
    education,
    certifications,
    achievements,
    resume,
    addExperience,
    deleteExperience,
    addEducation,
    deleteEducation,
    addCertification,
    deleteCertification,
  } = useProfile();

  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState('experience');

  // Modals
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expPeriod, setExpPeriod] = useState('2024 — Present');
  const [expLocation, setExpLocation] = useState('Remote');
  const [expDesc, setExpDesc] = useState('');

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduInst, setEduInst] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduPeriod, setEduPeriod] = useState('2020 — 2024');
  const [eduGrade, setEduGrade] = useState('CGPA 3.9');

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('2024');
  const [certUrl, setCertUrl] = useState('');

  const handleAddExperience = (e) => {
    e.preventDefault();
    addExperience({
      role: expRole,
      company: expCompany,
      period: expPeriod,
      location: expLocation,
      description: expDesc,
      highlights: ['Engineered mission-critical web services', 'Optimized client-side rendering speed'],
    });
    setExpModalOpen(false);
    success('Work experience entry added!');
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    addEducation({
      institution: eduInst,
      degree: eduDegree,
      period: eduPeriod,
      grade: eduGrade,
      location: 'Dhaka, Bangladesh',
      description: 'Specialized in Computer Science & Distributed Systems',
    });
    setEduModalOpen(false);
    success('Education credential added!');
  };

  const handleAddCertification = (e) => {
    e.preventDefault();
    addCertification({
      name: certName,
      issuer: certIssuer,
      issueDate: certDate,
      verifyUrl: certUrl || 'https://verify.credential.org',
      badge: `${certIssuer} Certified`,
    });
    setCertModalOpen(false);
    success('Certification credential added!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Resume & Career Credentials
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Curate your verified experience, degrees, certifications, and academic milestones.
          </p>
        </div>
      </div>

      <Tabs tabs={RESUME_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content: Experience */}
      {activeTab === 'experience' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-subtle pb-4">
            <div>
              <h3 className="text-base font-bold text-primary">Work Experience</h3>
              <p className="text-xs text-secondary">Career timeline and technical leadership</p>
            </div>
            <Button
              onClick={() => {
                setExpRole('');
                setExpCompany('');
                setExpDesc('');
                setExpModalOpen(true);
              }}
              variant="primary"
              size="sm"
              icon={FiPlus}
            >
              Add Experience
            </Button>
          </div>

          <div className="space-y-4">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-surface-dark/70 border border-subtle flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-primary">{exp.role}</h4>
                    <span className="text-xs text-accent font-mono">{exp.period}</span>
                  </div>
                  <div className="text-xs text-secondary font-medium">{exp.company} • {exp.location}</div>
                  <p className="text-xs text-secondary leading-relaxed pt-1">{exp.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    deleteExperience(exp.id);
                    info('Experience entry removed.');
                  }}
                  className="p-2 rounded-xl bg-surface-deep text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Education */}
      {activeTab === 'education' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-subtle pb-4">
            <div>
              <h3 className="text-base font-bold text-primary">Education & Academics</h3>
              <p className="text-xs text-secondary">University degrees and honors</p>
            </div>
            <Button
              onClick={() => {
                setEduInst('');
                setEduDegree('');
                setEduModalOpen(true);
              }}
              variant="primary"
              size="sm"
              icon={FiPlus}
            >
              Add Degree
            </Button>
          </div>

          <div className="space-y-4">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="p-5 rounded-2xl bg-surface-dark/70 border border-subtle flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-primary">{edu.institution}</h4>
                    <span className="text-xs text-accent font-mono">{edu.period}</span>
                  </div>
                  <div className="text-xs text-secondary font-medium">{edu.degree}</div>
                  {edu.grade && <div className="text-xs text-success font-mono">{edu.grade}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    deleteEducation(edu.id);
                    info('Education entry removed.');
                  }}
                  className="p-2 rounded-xl bg-surface-deep text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Certifications */}
      {activeTab === 'certifications' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-subtle pb-4">
            <div>
              <h3 className="text-base font-bold text-primary">Licenses & Certifications</h3>
              <p className="text-xs text-secondary">Industry-recognized professional badges</p>
            </div>
            <Button
              onClick={() => {
                setCertName('');
                setCertIssuer('');
                setCertModalOpen(true);
              }}
              variant="primary"
              size="sm"
              icon={FiPlus}
            >
              Add Certification
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-surface-dark/70 border border-subtle flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-primary">{cert.name}</h4>
                  <div className="text-xs text-secondary">{cert.issuer}</div>
                  <div className="text-[11px] text-muted font-mono mt-1">Issued {cert.issueDate}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    deleteCertification(cert.id);
                    info('Certification entry removed.');
                  }}
                  className="p-2 rounded-xl bg-surface-deep text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Achievements */}
      {activeTab === 'achievements' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
          <h3 className="text-base font-bold text-primary border-b border-subtle pb-4">
            Honors & Achievements
          </h3>

          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-5 rounded-2xl bg-surface-dark/70 border border-subtle flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-warning-soft text-warning shrink-0">
                  <FiAward className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-primary">{ach.title}</h4>
                    <span className="text-xs text-muted font-mono">{ach.date}</span>
                  </div>
                  <p className="text-xs font-medium text-warning">{ach.organization}</p>
                  <p className="text-xs text-secondary">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="Add Experience"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddExperience} className="space-y-4 py-2">
          <Input
            label="Job Title / Role"
            value={expRole}
            onChange={(e) => setExpRole(e.target.value)}
            required
            placeholder="Senior Software Engineer"
          />
          <Input
            label="Company"
            value={expCompany}
            onChange={(e) => setExpCompany(e.target.value)}
            required
            placeholder="Tech Systems Corp"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Period"
              value={expPeriod}
              onChange={(e) => setExpPeriod(e.target.value)}
              placeholder="2023 — Present"
            />
            <Input
              label="Location"
              value={expLocation}
              onChange={(e) => setExpLocation(e.target.value)}
              placeholder="Remote / Dhaka"
            />
          </div>
          <Textarea
            label="Role Summary"
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
            rows={3}
            placeholder="Describe key responsibilities and impact..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setExpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title="Add Education"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddEducation} className="space-y-4 py-2">
          <Input
            label="Institution"
            value={eduInst}
            onChange={(e) => setEduInst(e.target.value)}
            required
            placeholder="University Name"
          />
          <Input
            label="Degree & Field"
            value={eduDegree}
            onChange={(e) => setEduDegree(e.target.value)}
            required
            placeholder="B.Sc. in Computer Science"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Period"
              value={eduPeriod}
              onChange={(e) => setEduPeriod(e.target.value)}
              placeholder="2019 — 2023"
            />
            <Input
              label="Grade / CGPA"
              value={eduGrade}
              onChange={(e) => setEduGrade(e.target.value)}
              placeholder="3.85 / 4.00"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEduModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Add Certification"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCertification} className="space-y-4 py-2">
          <Input
            label="Certification Name"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            required
            placeholder="AWS Solutions Architect"
          />
          <Input
            label="Issuing Organization"
            value={certIssuer}
            onChange={(e) => setCertIssuer(e.target.value)}
            required
            placeholder="Amazon Web Services"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Date"
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              placeholder="Jan 2024"
            />
            <Input
              label="Verification URL"
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCertModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
