import React from "react";

// Consistent SVG icon set (Lucide-style: 24×24, currentColor stroke, round
// caps). No emoji anywhere in the product — icons are theming-aware vectors.

const PATHS = {
  sparkles: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 7c.6 2.5 2.5 4.4 5 5-2.5.6-4.4 2.5-5 5-.6-2.5-2.5-4.4-5-5 2.5-.6 4.4-2.5 5-5Z" />
    </>
  ),
  access: (
    <>
      <circle cx="12" cy="4.5" r="1.6" />
      <path d="M4 8h16M12 8v6M12 14l-3.5 6M12 14l3.5 6" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M18 18h2" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M4 19a2 2 0 0 1 2-2h12" />
    </>
  ),
  beaker: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 14h9" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  message: (
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
  ),
  check: <path d="m5 12 5 5L20 6" />,
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v5M12 18h.01" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3h10v5" />
      <path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  wand: (
    <>
      <path d="M15 4V2M15 10V8M11 6H9M21 6h-2" />
      <path d="m14 7 6 6M14.5 6.5 4 17a1.5 1.5 0 0 0 2 2L16.5 8.5" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  circleCheck: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.4 2.4L15.5 9.5" />
    </>
  ),
  puzzle: (
    <path d="M15.5 3.5a2 2 0 0 0-3.9-.6c-.1.4-.5.6-.9.6H8a1 1 0 0 0-1 1v2.7c0 .4-.2.8-.6.9a2 2 0 1 0 0 3.8c.4.1.6.5.6.9V19a1 1 0 0 0 1 1h2.7c.4 0 .8.2.9.6a2 2 0 0 0 3.8 0c.1-.4.5-.6.9-.6H20a1 1 0 0 0 1-1v-2.7c0-.4.2-.8.6-.9a2 2 0 0 0 0-3.8c-.4-.1-.6-.5-.6-.9V5a1 1 0 0 0-1-1h-2.7c-.4 0-.8-.2-.9-.6Z" />
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M22 20a6 6 0 0 0-4-5.6" />
    </>
  ),
  map: (
    <>
      <path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6l6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5M3 8v0" />
    </>
  ),
  bookOpen: (
    <>
      <path d="M12 6C10.5 5 8 4.5 4 4.5V18c4 0 6.5.5 8 1.5 1.5-1 4-1.5 8-1.5V4.5c-4 0-6.5.5-8 1.5Z" />
      <path d="M12 6v13.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h16" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 5.8 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.8-3.5-9S9.5 5.5 12 3Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  code: <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />,
  play: <path d="M6 4v16l14-8L6 4Z" />,
  spark: (
    <path d="M12 2c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6Z" />
  ),
  language: (
    <>
      <path d="M3 5h9M7 3v2c0 4-1.5 7-4 9" />
      <path d="M6 10c1.5 3 3.5 4.5 6 5" />
      <path d="m13 21 4-9 4 9M14.5 17h5" />
    </>
  ),
};

export default function Icon({ name, size, className = "", ...rest }) {
  const cls = size === "sm" ? "icon icon-sm" : size === "lg" ? "icon icon-lg" : "icon";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${cls} ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name] || null}
    </svg>
  );
}
