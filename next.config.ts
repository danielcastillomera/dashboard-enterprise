import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ============================================
     DASHBOARD ENTERPRISE — NEXT.JS CONFIG
     Security headers, cross-browser compat,
     performance optimization.
     ============================================ */

  // Security headers — OWASP recommended
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS protection (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unused browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Strict transport security (HTTPS only)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Content security policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
              "frame-src 'self' blob:",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Powered by header removal (security through obscurity)
  poweredByHeader: false,
};

export default nextConfig;
