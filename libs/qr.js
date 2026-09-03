import QRCode from 'qrcode';

export async function generateQrDataUrl(text, options = {}) {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      width: 400,
      ...options,
    };
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}

export async function generateQrSvg(text, options = {}) {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'svg',
      margin: 1,
      color: {
        dark: '#ffffff',
        light: '#00000000', // transparent
      },
      width: 320,
      ...options,
    };
    return await QRCode.toString(text, defaultOptions);
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return null;
  }
}
