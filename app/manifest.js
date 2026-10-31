export default function manifest() {
  return {
    name: 'OneMe — Your identity. One link.',
    short_name: 'OneMe',
    description: 'A personal digital identity and contact card.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#05050c',
    theme_color: '#05050c',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
