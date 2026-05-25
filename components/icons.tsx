// Icon set propio — trazos finos (1.5px), 24×24, currentColor.
// Sin dependencias externas. Estilo editorial: líneas largas, esquinas
// ligeramente redondeadas, escala consistente.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconLogo = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 19 L11 4 L18 19" />
    <path d="M7.2 13 H14.8" />
    <circle cx="20" cy="6" r="1.6" fill="currentColor" stroke="none" />
  </Base>
);

export const IconDashboard = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
    <rect x="3.5" y="15" width="7" height="5.5" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="5.5" rx="1.5" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
  </Base>
);

export const IconCalendar = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M8 3v4 M16 3v4 M3.5 10h17" />
    <circle cx="8.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
  </Base>
);

export const IconEvents = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5 H20" />
    <path d="M4 12 H20" />
    <path d="M4 17.5 H14" />
    <circle cx="20" cy="17.5" r="2.2" />
  </Base>
);

export const IconBell = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 16 V11 a6 6 0 0 1 12 0 v5 l1.5 2.5 H4.5 Z" />
    <path d="M10 20 a2 2 0 0 0 4 0" />
  </Base>
);

export const IconReports = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4 V20 H20" />
    <path d="M7 16 L11 11 L14 13 L19 7" />
    <circle cx="19" cy="7" r="1.4" fill="currentColor" stroke="none" />
  </Base>
);

export const IconAdmin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 L20 6.5 V12 c0 4-3.4 7.5-8 9 -4.6-1.5-8-5-8-9 V6.5 Z" />
    <path d="M9 12 l2.2 2.2 L15.5 10" />
  </Base>
);

export const IconUser = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5 c1.5-4 4.4-6 7.5-6 s6 2 7.5 6" />
  </Base>
);

export const IconLogout = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4 H6 a1.5 1.5 0 0 0 -1.5 1.5 v13 A1.5 1.5 0 0 0 6 20 h8" />
    <path d="M10 12 H20" />
    <path d="M17 9 L20 12 L17 15" />
  </Base>
);

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5 V19 M5 12 H19" />
  </Base>
);

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16 L20.5 20.5" />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7 V12 L15.5 14" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12.5 L10 17 L19 7" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6 L18 18 M18 6 L6 18" />
  </Base>
);

export const IconChevronLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 6 L8.5 12 L14.5 18" />
  </Base>
);

export const IconChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 6 L15.5 12 L9.5 18" />
  </Base>
);

export const IconChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9.5 L12 15.5 L18 9.5" />
  </Base>
);

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12 H20" />
    <path d="M14 6 L20 12 L14 18" />
  </Base>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 L17 7" />
    <path d="M8 7 H17 V16" />
  </Base>
);

export const IconLocation = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21 c-4-4.5-7-7.7-7-11 a7 7 0 0 1 14 0 c0 3.3-3 6.5-7 11 Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Base>
);

export const IconTag = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12 V5 a1 1 0 0 1 1-1 h7 l8 8 -8 8 Z" />
    <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none" />
  </Base>
);

export const IconFlag = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 21 V4" />
    <path d="M5 4 H17 L14.5 8 L17 12 H5" />
  </Base>
);

export const IconPaperclip = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 11 L12 18 a4.5 4.5 0 0 1 -6.4 -6.4 L13 4 a3 3 0 0 1 4.3 4.3 L10 16 a1.5 1.5 0 0 1 -2.1 -2.1 L14.5 9" />
  </Base>
);

export const IconEdit = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 4.5 L19.5 9.5 L9 20 H4 V15 Z" />
    <path d="M13 6 L18 11" />
  </Base>
);

export const IconTrash = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7 H20" />
    <path d="M9 7 V4.5 A1.5 1.5 0 0 1 10.5 3 H13.5 A1.5 1.5 0 0 1 15 4.5 V7" />
    <path d="M6 7 L7 20 A1.5 1.5 0 0 0 8.5 21.5 H15.5 A1.5 1.5 0 0 0 17 20 L18 7" />
    <path d="M10.5 11 V17 M13.5 11 V17" />
  </Base>
);

export const IconMail = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6 L12 13 L20.5 6" />
  </Base>
);

export const IconSparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 L13.6 9.6 L20 11 L13.6 12.4 L12 19 L10.4 12.4 L4 11 L10.4 9.6 Z" />
  </Base>
);

export const IconMenu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7 H20 M4 12 H20 M4 17 H14" />
  </Base>
);

export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 L20 6.5 V12 c0 4-3.4 7.5-8 9 -4.6-1.5-8-5-8-9 V6.5 Z" />
  </Base>
);

export const IconRefresh = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12 a8 8 0 0 1 14-5.3" />
    <path d="M18 3 V7 H14" />
    <path d="M20 12 a8 8 0 0 1 -14 5.3" />
    <path d="M6 21 V17 H10" />
  </Base>
);

export const IconDot = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
  </Base>
);

export const IconCircle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
  </Base>
);
