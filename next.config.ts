import type { NextConfig } from "next";

// Derived at build/dev time from the Supabase project URL so CSP only
// allow-lists this specific project's host, not every *.supabase.co project.
// Needed for: the branding-bucket company logo (rendered via <img src=...>
// in Settings > Company Profile) and any browser-side Supabase Auth/REST
// calls (lib/supabase/browser.ts).
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();

const isDev = process.env.NODE_ENV !== "production";

// Next.js's dev-mode HMR client needs 'unsafe-eval'; production doesn't.
// style-src needs 'unsafe-inline' because Radix UI positions popovers/
// dropdowns/tooltips via inline style attributes at runtime — there's no
// nonce plumbing for that today, so this is the pragmatic floor rather than
// a fully strict-dynamic CSP.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:${supabaseHost ? ` ${supabaseHost}` : ""}`,
  `font-src 'self' data:`,
  `connect-src 'self'${supabaseHost ? ` ${supabaseHost}` : ""}`,
  // Same-origin only: the broadcast PDF preview panel embeds our own
  // /admin/test-cycles/[id]/broadcast/preview/* routes in an <iframe>.
  `frame-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  // Belt-and-suspenders with the X-Frame-Options header below — this app is
  // never meant to be embedded in someone else's page.
  `frame-ancestors 'none'`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Lab report PDFs are capped at 15MB in lib/actions/results.ts; this
      // just needs to be comfortably above that to cover FormData overhead.
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
