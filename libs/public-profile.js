import { profileDataSchema } from './profile-validation.js';

export function createPublicProfilePayload(account, storedData) {
  const parsed = profileDataSchema.safeParse(storedData);
  if (!parsed.success || parsed.data.profile.isPublished !== true) return null;

  const data = parsed.data;
  const privacy = data.profile.privacy || {};
  const user = {
    ...data.profile,
    id: account.id,
    name: account.name,
    username: account.username,
    isVerified: true,
    privacy,
  };
  if (privacy.showEmail === true) user.email = account.email;
  if (privacy.showPhone !== true) delete user.phone;
  if (privacy.showLocation !== true) user.location = '';

  return {
    user,
    projects: data.projects,
    experience: data.experience,
    education: data.education,
    certifications: data.certifications,
    achievements: data.achievements,
    resume: privacy.showResume === true
      ? {
        fileName: data.resume.fileName,
        fileSize: data.resume.fileSize,
        fileUrl: data.resume.fileUrl,
        updatedAt: data.resume.updatedAt,
        summary: data.resume.summary,
        downloadCount: data.resume.downloadCount,
      }
      : null,
    themeId: user.themeId,
    indexable: privacy.searchEngineIndexing === true,
  };
}
