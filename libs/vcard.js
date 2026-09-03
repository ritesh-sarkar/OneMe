/**
 * Generates an RFC 6350 compliant vCard (.vcf) string and triggers client-side download.
 */
export function generateVCard(user, options = {}) {
  const {
    includeEmail = true,
    includePhone = true,
    includeLocation = true,
    includeSocials = true,
    includeNotes = true,
  } = options;

  const names = (user.name || 'User').split(' ');
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  let vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${user.name || 'OneMe User'}`,
    `TITLE:${user.title || ''}`,
    `ORG:OneMe Digital Identity`,
  ];

  if (includeEmail && user.email) {
    vcard.push(`EMAIL;type=INTERNET;type=WORK;type=pref:${user.email}`);
  }

  if (includePhone && user.phone) {
    vcard.push(`TEL;type=CELL;type=VOICE;type=pref:${user.phone}`);
  }

  if (includeLocation && user.location) {
    vcard.push(`ADR;type=WORK:;;;${user.location};;;`);
  }

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/@${user.username}` 
    : `https://oneme.app/@${user.username}`;
  
  vcard.push(`URL;type=WORK:${publicUrl}`);

  if (includeSocials && Array.isArray(user.socials)) {
    user.socials.forEach((soc) => {
      if (soc.url) {
        vcard.push(`X-SOCIALPROFILE;type=${soc.platform}:${soc.url}`);
      }
    });
  }

  if (includeNotes && (user.tagline || user.bio)) {
    const note = `${user.tagline || ''} | ${user.bio || ''}`.replace(/\n/g, ' ');
    vcard.push(`NOTE:${note}`);
  }

  vcard.push('REV:' + new Date().toISOString());
  vcard.push('END:VCARD');

  return vcard.join('\r\n');
}

export function downloadVCard(user, options = {}) {
  try {
    const vcardData = generateVCard(user, options);
    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const filename = `${(user.username || user.name || 'contact').toLowerCase().replace(/\s+/g, '_')}_oneme.vcf`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return true;
  } catch (err) {
    console.error('Failed to download vCard:', err);
    return false;
  }
}
