'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiFolder,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGithub,
  FiExternalLink,
  FiActivity,
  FiStar,
  FiCheck,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/context/ToastContext';

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProfile();
  const { success, info } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTechnologies, setFormTechnologies] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formLiveUrl, setFormLiveUrl] = useState('');
  const [formStatus, setFormStatus] = useState('Live & Active');
  const [formMetrics, setFormMetrics] = useState('');

  const openNewProjectModal = () => {
    setEditingProjectId(null);
    setFormTitle('');
    setFormDescription('');
    setFormTechnologies('React, Next.js, Tailwind CSS');
    setFormImage('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800');
    setFormGithubUrl('https://github.com/riteshsarkar/');
    setFormLiveUrl('https://demo.app');
    setFormStatus('Live & Active');
    setFormMetrics('10k+ users');
    setModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    setEditingProjectId(proj.id);
    setFormTitle(proj.title);
    setFormDescription(proj.description);
    setFormTechnologies((proj.technologies || []).join(', '));
    setFormImage(proj.image || '');
    setFormGithubUrl(proj.githubUrl || '');
    setFormLiveUrl(proj.liveUrl || '');
    setFormStatus(proj.status || 'Live');
    setFormMetrics(proj.metrics || '');
    setModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    const techArray = formTechnologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectData = {
      title: formTitle,
      description: formDescription,
      technologies: techArray,
      image: formImage,
      githubUrl: formGithubUrl,
      liveUrl: formLiveUrl,
      status: formStatus,
      metrics: formMetrics,
      stars: 120,
    };

    if (editingProjectId) {
      updateProject(editingProjectId, projectData);
      success('Project details updated!');
    } else {
      addProject(projectData);
      success('New project added to your OneMe showcase!');
    }

    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    deleteProject(id);
    info(`Deleted project: ${title}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Featured Projects
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Showcase your best engineering work, open-source repositories, and applications.
          </p>
        </div>

        <Button
          onClick={openNewProjectModal}
          variant="primary"
          size="md"
          icon={FiPlus}
        >
          Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-glass-soft border border-subtle space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-panel text-secondary flex items-center justify-center mx-auto">
            <FiFolder className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-primary">No projects yet</h3>
            <p className="text-xs text-secondary">
              Show the world what you&apos;ve built by adding your first project.
            </p>
          </div>
          <Button onClick={openNewProjectModal} variant="primary" size="sm" icon={FiPlus}>
            Add Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <motion.div
              key={proj.id}
              whileHover={{ y: -3 }}
              className="rounded-3xl bg-glass border border-subtle overflow-hidden hover:border-light transition-all flex flex-col justify-between"
            >
              {/* Image */}
              {proj.image && (
                <div className="h-44 w-full relative bg-surface-dark overflow-hidden">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {proj.status && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="indigo" size="sm">
                        {proj.status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-primary">{proj.title}</h3>
                  <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(proj.technologies || []).map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-glass-soft text-secondary text-[10px] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-subtle">
                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-surface-dark text-secondary hover:text-primary transition-colors"
                      >
                        <FiGithub className="w-4 h-4" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-surface-dark text-secondary hover:text-accent transition-colors"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditProjectModal(proj)}
                      className="p-2 rounded-lg bg-surface-dark hover:bg-surface-panel text-secondary transition-colors"
                      title="Edit Project"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.id, proj.title)}
                      className="p-2 rounded-lg bg-surface-dark hover:bg-danger-soft text-secondary hover:text-danger transition-colors"
                      title="Delete Project"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Edit / Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProjectId ? 'Edit Project' : 'Add New Project'}
        description="Share key highlights, repository, and live demo link"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveProject} className="space-y-4 py-2">
          <Input
            label="Project Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            placeholder="PulseFlow — Real-time Distributed Analytics"
          />

          <Textarea
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            required
            rows={3}
            placeholder="Explain the problem solved, architectural decisions, and capabilities..."
          />

          <Input
            label="Technologies (comma-separated)"
            value={formTechnologies}
            onChange={(e) => setFormTechnologies(e.target.value)}
            placeholder="Next.js, React, Tailwind CSS, WebSockets"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              value={formGithubUrl}
              onChange={(e) => setFormGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
            <Input
              label="Live Application Demo URL"
              value={formLiveUrl}
              onChange={(e) => setFormLiveUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Cover Image URL"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <Input
              label="Status Tag"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              placeholder="Live & Active"
            />
          </div>

          <Input
            label="Key Metric / Traction"
            value={formMetrics}
            onChange={(e) => setFormMetrics(e.target.value)}
            placeholder="100k+ events/sec or 2.4k npm downloads"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-subtle">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {editingProjectId ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
