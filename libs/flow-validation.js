import { z } from 'zod';

export const flowFields = ['email', 'phone', 'socials', 'resume'];

export const createFlowRequestSchema = z.object({
  targetUsername: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{0,29}$/),
  shareFields: z.array(z.enum(flowFields)).min(1).max(flowFields.length),
}).strict().refine(({ shareFields }) => new Set(shareFields).size === shareFields.length, {
  message: 'Choose each information type only once.',
});

export const respondToFlowSchema = z.object({
  action: z.enum(['accept', 'decline']),
  shareFields: z.array(z.enum(flowFields)).max(flowFields.length),
}).strict().refine(({ action, shareFields }) => (
  action === 'decline' || shareFields.length > 0
), {
  message: 'Choose at least one information type to share.',
});

export function createFlowCard(account, profile) {
  return {
    name: account.name,
    username: account.username,
    title: profile?.title || '',
    avatar: profile?.avatar || '',
  };
}

export function createFlowContactData({ account, profile, fields }) {
  const selected = new Set(fields);
  const socials = selected.has('socials')
    ? (profile?.socials || [])
      .filter((social) => social.url)
      .map(({ label, platform, url }) => ({ label, platform, url }))
    : [];
  const resume = selected.has('resume') && profile?.resume?.fileUrl
    ? {
      fileName: profile.resume.fileName || 'Resume.pdf',
      fileUrl: profile.resume.fileUrl,
    }
    : { fileName: '', fileUrl: '' };

  return {
    email: selected.has('email') ? account.email : '',
    phone: selected.has('phone') ? profile?.phone || '' : '',
    socials,
    resume,
  };
}

export function availableFlowFields(account, profile) {
  return flowFields.filter((field) => {
    if (field === 'email') return Boolean(account.email);
    if (field === 'phone') return Boolean(profile?.phone);
    if (field === 'socials') return (profile?.socials || []).some((social) => social.url);
    if (field === 'resume') return Boolean(profile?.resume?.fileUrl);
    return false;
  });
}
