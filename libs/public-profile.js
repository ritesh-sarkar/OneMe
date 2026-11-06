import { profileDataSchema } from './profile-validation.js';

export function getPublicContactMethods(user) {
  const email = user?.privacy?.showEmail !== false && typeof user?.email === 'string'
    ? user.email.trim()
    : '';
  const phone = user?.privacy?.showPhone !== false && typeof user?.phone === 'string'
    ? user.phone.trim()
    : '';

  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    phone: /^[+\d().\-\s]{6,40}$/.test(phone) && /\d/.test(phone) ? phone : '',
  };
}

export function createPublicProfilePayload(account, storedData) {
  const parsed = profileDataSchema.safeParse(storedData);
  if (!parsed.success || parsed.data.profile.isPublished !== true) return null;

  const data = parsed.data;
  const privacy = data.profile.privacy || {};
  const visibility = data.profile.sectionVisibility || {};
  const isVisible = (section) => visibility[section] !== false;
  const user = {
    ...data.profile,
    id: account.id,
    name: account.name,
    username: account.username,
    isVerified: true,
    privacy,
  };
  if (!isVisible('about')) delete user.bio;
  if (!isVisible('cta')) delete user.customCta;
  if (!isVisible('socials')) user.socials = [];
  if (!isVisible('skills')) user.skills = [];
  if (isVisible('contact') && privacy.showEmail === true) user.email = account.email;
  if (!isVisible('contact') || privacy.showPhone !== true) delete user.phone;
  if (!isVisible('contact') || privacy.showEmail !== true) delete user.email;
  if (privacy.showLocation !== true) user.location = '';

  return {
    user,
    projects: isVisible('projects') ? data.projects : [],
    experience: isVisible('experience') ? data.experience : [],
    education: isVisible('education') ? data.education : [],
    certifications: isVisible('certifications') ? data.certifications : [],
    achievements: isVisible('achievements') ? data.achievements : [],
    resume: isVisible('resume') && privacy.showResume === true
      ? {
        fileName: data.resume.fileName,
        fileSize: data.resume.fileSize,
        fileUrl: data.resume.publicId
          ? `/${encodeURIComponent(account.username)}/resume`
          : '',
        updatedAt: data.resume.updatedAt,
        summary: data.resume.summary,
        downloadCount: data.resume.downloadCount,
      }
      : null,
    themeId: user.themeId,
    indexable: privacy.searchEngineIndexing === true,
  };
}
