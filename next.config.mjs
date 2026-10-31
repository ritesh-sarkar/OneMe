const nextConfig = {
  async headers() {
    const developmentScriptSources = process.env.NODE_ENV === 'production'
      ? ''
      : " 'unsafe-eval'";
    const developmentConnectSources = process.env.NODE_ENV === 'production'
      ? ''
      : ' http://localhost:* ws://localhost:*';
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${developmentScriptSources}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      `connect-src 'self' https://api.cloudinary.com https://*.cloudinary.com${developmentConnectSources}`,
      "manifest-src 'self'",
      "worker-src 'self'",
    ];
    if (process.env.NODE_ENV === 'production') {
      contentSecurityPolicy.push('upgrade-insecure-requests');
    }

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: contentSecurityPolicy.join('; ') },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
