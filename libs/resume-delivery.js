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

export function isAuthenticatedCloudinaryResumeUrl(value, cloudName, publicId) {
  let url;
  try {
    url = value instanceof URL ? value : new URL(value);
  } catch {
    return false;
  }
  return url.protocol === 'https:'
    && url.hostname === 'res.cloudinary.com'
    && url.pathname.startsWith(`/${cloudName}/raw/authenticated/`)
    && url.pathname.endsWith(`/${publicId}`);
}

export function isPdfResumeFormat(format) {
  if (format == null) return true;
  if (typeof format !== 'string') return false;
  const normalizedFormat = format.trim().toLowerCase();
  return normalizedFormat === ''
    || normalizedFormat === 'pdf'
    || normalizedFormat === 'application/pdf'
    || normalizedFormat === 'application/x-pdf';
}

export function createResumePublicId(ownerId, fileToken) {
  if (!/^[a-f0-9]{24}$/i.test(ownerId) || !/^[a-f0-9]{32}$/i.test(fileToken)) {
    throw new Error('Invalid resume asset identity.');
  }
  return `oneme/${ownerId}/resume/${fileToken}.pdf`;
}
