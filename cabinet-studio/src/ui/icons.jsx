const S = ({ size = 18, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

export const IconCube = (p) => (
  <S {...p}>
    <path d="M12 2.8 21 7.4v9.2L12 21.2 3 16.6V7.4z" />
    <path d="M3 7.4l9 4.6 9-4.6M12 12v9.2" />
  </S>
);
export const IconPalette = (p) => (
  <S {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7z" />
    <circle cx="7.5" cy="11" r="1.1" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="1.1" fill="currentColor" />
    <circle cx="15" cy="8" r="1.1" fill="currentColor" />
  </S>
);
export const IconLayers = (p) => (
  <S {...p}>
    <path d="M12 3 3 7.5l9 4.5 9-4.5z" />
    <path d="M3 12.5 12 17l9-4.5M3 17 12 21.5 21 17" />
  </S>
);
export const IconLamp = (p) => (
  <S {...p}>
    <path d="M9 3h6l3 7H6z" />
    <path d="M12 10v6M9 21h6" />
    <path d="M12 16a2.5 2.5 0 0 0-2.5 2.5V21h5v-2.5A2.5 2.5 0 0 0 12 16z" />
  </S>
);
export const IconRoom = (p) => (
  <S {...p}>
    <path d="M3 20V9l9-5 9 5v11" />
    <path d="M3 20h18M9 20v-6h6v6" />
  </S>
);
export const IconWardrobe = (p) => (
  <S {...p}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M12 3v18M9.5 10v3M14.5 10v3" />
  </S>
);
export const IconCamera = (p) => (
  <S {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
    <circle cx="12" cy="13" r="3.4" />
  </S>
);
export const IconUndo = (p) => (
  <S {...p}>
    <path d="M4 9h11a5 5 0 0 1 0 10H8" />
    <path d="M4 9l4-4M4 9l4 4" />
  </S>
);
export const IconRedo = (p) => (
  <S {...p}>
    <path d="M20 9H9a5 5 0 0 0 0 10h7" />
    <path d="M20 9l-4-4M20 9l-4 4" />
  </S>
);
export const IconTrash = (p) => (
  <S {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </S>
);
export const IconPlus = (p) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
export const IconCopy = (p) => (
  <S {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </S>
);
export const IconArrowRight = (p) => (
  <S {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </S>
);
export const IconArrowLeft = (p) => (
  <S {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </S>
);
export const IconDownload = (p) => (
  <S {...p}>
    <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
  </S>
);
export const IconSparkle = (p) => (
  <S {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  </S>
);
export const IconMoon = (p) => (
  <S {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </S>
);
export const IconSun = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </S>
);
export const IconGrid = (p) => (
  <S {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </S>
);
export const IconRuler = (p) => (
  <S {...p}>
    <rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-8 12 12)" />
    <path d="M7 9.5v3M10.5 9v4M14 8.5v3M17.5 8v4" />
  </S>
);
export const IconRotate = (p) => (
  <S {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4h-4" />
  </S>
);
export const IconReset = (p) => (
  <S {...p}>
    <path d="M4 12a8 8 0 1 0 2.6-5.9" />
    <path d="M4 4v4h4" />
  </S>
);
export const IconGrip = (p) => (
  <S {...p}>
    <circle cx="9" cy="6" r="1.3" fill="currentColor" />
    <circle cx="15" cy="6" r="1.3" fill="currentColor" />
    <circle cx="9" cy="12" r="1.3" fill="currentColor" />
    <circle cx="15" cy="12" r="1.3" fill="currentColor" />
    <circle cx="9" cy="18" r="1.3" fill="currentColor" />
    <circle cx="15" cy="18" r="1.3" fill="currentColor" />
  </S>
);
export const IconChevron = (p) => (
  <S {...p}>
    <path d="M6 9l6 6 6-6" />
  </S>
);
export const IconCheck = (p) => (
  <S {...p}>
    <path d="M5 13l4 4L19 7" />
  </S>
);
export const IconFlame = (p) => (
  <S {...p}>
    <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-2 1-3.4 2-4.5 0 1.6.8 2.5 1.6 2.5C11.6 10 12 6 12 3z" />
  </S>
);
export const IconSink = (p) => (
  <S {...p}>
    <path d="M3 11h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />
    <path d="M12 11V6a2 2 0 0 1 2-2h2" />
  </S>
);
export const IconX = (p) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);
export const IconEye = (p) => (
  <S {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);
export const IconDoor = (p) => (
  <S {...p}>
    <path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h8A1.5 1.5 0 0 1 16 4.5V21M3 21h18" />
    <circle cx="13" cy="12" r="1" fill="currentColor" />
  </S>
);
export const IconHandle = (p) => (
  <S {...p}>
    <path d="M7 4v16M17 4v16" />
    <rect x="9" y="8" width="6" height="8" rx="3" />
  </S>
);
export const IconMoney = (p) => (
  <S {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 10v4M18 10v4" />
  </S>
);
export const IconInfo = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </S>
);
