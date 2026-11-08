export function isAllowedCloudinaryResumeUrl(value, cloudName) {
  let url;
  try {
    url = value instanceof URL ? value : new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;
  if (url.hostname === 'res.cloudinary.com') {
    return url.pathname.startsWith(`/${cloudName}/raw/`);
  }
  return url.hostname === 'api.cloudinary.com'
    && url.pathname === `/v1_1/${cloudName}/raw/download`;
}

export function createResumePublicId(ownerId, fileToken) {
  if (!/^[a-f0-9]{24}$/i.test(ownerId) || !/^[a-f0-9]{32}$/i.test(fileToken)) {
    throw new Error('Invalid resume asset identity.');
  }
  return `oneme/${ownerId}/resume/${fileToken}.pdf`;
}
