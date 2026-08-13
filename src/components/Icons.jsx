/**
 * Authored SVG icons, one consistent stroke weight (1.6) on a 24x24 grid.
 *
 * The brief calls for the club's custom emoji set in the link hub. That asset
 * has not been delivered, and emoji-as-icon-system is otherwise disallowed, so
 * these drawn marks stand in. Swapping them for the emoji set later is a
 * change to LinkHub only — nothing else imports these for decoration.
 *
 * Icons here are always paired with a text label, so each is aria-hidden and
 * the label carries the accessible name.
 */

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export const InstagramIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const LinkedInIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="7.5" y1="10.5" x2="7.5" y2="17" />
    <circle cx="7.5" cy="7.2" r="1" fill="currentColor" stroke="none" />
    <path d="M11.5 17v-3.6a2.4 2.4 0 0 1 4.8 0V17" />
    <line x1="11.5" y1="10.5" x2="11.5" y2="13.4" />
  </svg>
);

export const SlackIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="9.6" y="3" width="4.8" height="10.8" rx="2.4" />
    <rect x="3" y="9.6" width="10.8" height="4.8" rx="2.4" />
    <path d="M14.4 9.6h4.2a2.4 2.4 0 1 1-2.4 2.4" />
    <path d="M9.6 14.4v4.2a2.4 2.4 0 1 0 2.4-2.4" />
  </svg>
);

export const MailIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </svg>
);

export const ArrowRightIcon = (props) => (
  <svg {...base} {...props}>
    <line x1="4" y1="12" x2="19" y2="12" />
    <polyline points="13,6 19,12 13,18" />
  </svg>
);

export const ExternalIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M14 4h6v6" />
    <line x1="20" y1="4" x2="11" y2="13" />
    <path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
  </svg>
);

/** Reserved-photo mark for an empty board slot. */
export const ImagePlaceholderIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.6" cy="9.4" r="1.6" />
    <path d="m4 17 4.8-4.6a1.6 1.6 0 0 1 2.2 0L15 16" />
    <path d="m13.6 14.4 2-1.9a1.6 1.6 0 0 1 2.2 0L20 14.7" />
  </svg>
);

export const CalendarIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </svg>
);
