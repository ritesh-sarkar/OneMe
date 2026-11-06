import { z } from 'zod';

const fieldId = z.string()
  .min(1)
  .max(200)
  .regex(/^(?:name|avatar|title|bio|email|phone|resume|socials|social:[\w.%~-]+|project:[\w.%~-]+|achievement:[\w.%~-]+)$/);
const MAX_SELECTED_FIELDS = 300;
const selectedFields = z.array(fieldId)
  .min(1)
  .max(MAX_SELECTED_FIELDS)
  .refine((fields) => new Set(fields).size === fields.length, {
    message: 'Choose each information field only once.',
  });

export const flowFields = ['email', 'phone', 'socials', 'resume'];
export const flowSelectionSchema = z.object({ shareFields: selectedFields }).strict();

export const createFlowRequestSchema = z.object({
  targetUsername: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{0,29}$/),
  shareFields: selectedFields,
}).strict();

export const respondToFlowSchema = z.object({
  action: z.enum(['accept', 'decline']),
  shareFields: z.array(fieldId).max(MAX_SELECTED_FIELDS),
}).strict().refine(({ action, shareFields }) => (
  action === 'decline' || shareFields.length > 0
), {
  message: 'Choose at least one information field to share.',
}).refine(({ shareFields }) => new Set(shareFields).size === shareFields.length, {
  message: 'Choose each information field only once.',
});

function isValidPhone(value) {
  return typeof value === 'string'
    && /^[+\d().\-\s]{6,40}$/.test(value.trim())
    && /\d/.test(value);
}

function validHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function encodeFieldKey(value) {
  try {
    const encoded = encodeURIComponent(value).replace(/[!'()*]/g, (char) => (
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    ));
    return encoded.length <= 190 ? encoded : '';
  } catch {
    return '';
  }
}

function addField(fields, id, label, type, value, details, requestLabel) {
  if (typeof value === 'string' && !value.trim()) return;
  if (value == null) return;
  fields.push({
    id,
    label,
    type,
    value: typeof value === 'string' ? value.trim() : '',
    ...(details ? { details } : {}),
    ...(requestLabel ? { requestLabel } : {}),
  });
}

export function getFlowFieldOptions(account, profile, data = {}) {
  const fields = [];
  addField(fields, 'name', 'Display name', 'text', account?.name);
  if (typeof profile?.avatar === 'string' && profile.avatar.startsWith('https://')) {
    addField(fields, 'avatar', 'Profile image', 'image', profile.avatar);
  }
  addField(fields, 'title', 'Professional headline', 'text', profile?.title);
  addField(fields, 'bio', 'Bio', 'text', profile?.bio);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account?.email || '')) {
    addField(fields, 'email', 'Email address', 'email', account.email);
  }
  if (isValidPhone(profile?.phone)) addField(fields, 'phone', 'Phone number', 'phone', profile.phone);

  for (const social of profile?.socials || []) {
    if (!social?.id || !validHttpUrl(social.url)) continue;
    const encodedId = encodeFieldKey(social.id);
    if (!encodedId) continue;
    const id = `social:${encodedId}`;
    addField(fields, id, social.label || social.platform || 'Social profile', 'url', social.url);
  }

  for (const [index, project] of (data.projects || []).entries()) {
    if (!project?.id || !project.title?.trim()) continue;
    const encodedId = encodeFieldKey(project.id);
    if (!encodedId) continue;
    const details = {
      title: project.title,
      description: project.description || '',
      technologies: project.technologies || [],
      githubUrl: validHttpUrl(project.githubUrl) ? project.githubUrl : '',
      liveUrl: validHttpUrl(project.liveUrl) ? project.liveUrl : '',
    };
    addField(
      fields,
      `project:${encodedId}`,
      `Project · ${project.title}`,
      'project',
      project.title,
      details,
      `Project entry ${index + 1}`,
    );
  }

  for (const [index, achievement] of (data.achievements || []).entries()) {
    if (!achievement?.id || !achievement.title?.trim()) continue;
    const encodedId = encodeFieldKey(achievement.id);
    if (!encodedId) continue;
    addField(
      fields,
      `achievement:${encodedId}`,
      `Achievement · ${achievement.title}`,
      'achievement',
      achievement.title,
      {
        organization: achievement.organization || '',
        date: achievement.date || '',
        description: achievement.description || '',
      },
      `Achievement entry ${index + 1}`,
    );
  }

  const ownerId = account?.id || account?._id?.toString();
  if (
    ownerId
    && data.resume?.publicId?.startsWith(`oneme/${ownerId}/resume/`)
    && data.resume?.fileUrl
  ) {
    addField(
      fields,
      'resume',
      'Resume',
      'resume',
      `/api/profiles/${encodeURIComponent(account.username)}/resume`,
      { fileName: data.resume.fileName || 'Resume.pdf' },
    );
  }

  if ((profile?.socials || []).some((social) => validHttpUrl(social?.url))) {
    fields.push({ id: 'socials', label: 'All social profiles (legacy request)', type: 'legacy', value: '' });
  }
  return fields;
}

export function createFlowCard(account, profile) {
  return {
    name: account.name,
    username: account.username,
    title: profile?.title || '',
    avatar: profile?.avatar || '',
  };
}

export function createFlowContactData({ account, profile, fields, data = {} }) {
  const options = getFlowFieldOptions(account, profile, data);
  const selected = new Set(fields);
  const selectedOptions = options.filter((field) => selected.has(field.id) && field.id !== 'socials');
  const socials = selected.has('socials')
    ? (profile?.socials || [])
      .filter((social) => validHttpUrl(social?.url))
      .map(({ label, platform, url }) => ({ label, platform, url }))
    : selectedOptions
      .filter((field) => field.id.startsWith('social:'))
      .map((field) => ({ label: field.label, platform: field.label, url: field.value }));
  const resumeField = selectedOptions.find((field) => field.id === 'resume');

  return {
    email: selected.has('email') ? account.email : '',
    phone: selected.has('phone') ? profile?.phone || '' : '',
    socials,
    resume: resumeField
      ? { fileName: resumeField.details.fileName, fileUrl: resumeField.value }
      : { fileName: '', fileUrl: '' },
    sharedFields: selectedOptions,
  };
}

export function availableFlowFields(account, profile, data = {}) {
  return getFlowFieldOptions(account, profile, data).map((field) => field.id);
}
