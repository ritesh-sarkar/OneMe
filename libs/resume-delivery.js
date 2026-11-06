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
