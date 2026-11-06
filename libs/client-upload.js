export async function uploadCredentialImage(file, ownerId) {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
  if (!allowedTypes.has(file?.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or AVIF image.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Choose an image smaller than 5 MB.');
  }

  const signatureResponse = await fetch('/api/uploads/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'credential' }),
  });
  const signature = await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(signature.error || 'Credential image uploads are unavailable.');
  }

  const formData = new FormData();
  Object.entries(signature.params).forEach(([key, value]) => formData.append(key, String(value)));
  formData.append('api_key', signature.apiKey);
  formData.append('signature', signature.signature);
  formData.append('file', file);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
    { method: 'POST', body: formData },
  );
  const result = await uploadResponse.json();
  let uploadedUrl;
  try {
    uploadedUrl = new URL(result.secure_url || '');
  } catch {
    throw new Error(result.error?.message || 'The image provider rejected the upload.');
  }

  if (
    !uploadResponse.ok ||
    uploadedUrl.protocol !== 'https:' ||
    uploadedUrl.hostname !== 'res.cloudinary.com' ||
    !result.public_id?.startsWith(`oneme/${ownerId}/credentials/`) ||
    !/^[a-f0-9]{32}$/i.test(result.public_id.split('/').at(-1) || '')
  ) {
    throw new Error(result.error?.message || 'The image provider rejected the upload.');
  }

  return uploadedUrl.toString();
}
