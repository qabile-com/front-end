import type { SVGProps } from 'react';

type IconRenderer = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const stroke = (
  inner: React.ReactNode,
  { width = 1.8, caps = true }: { width?: number; caps?: boolean } = {},
): IconRenderer => {
  const Render = (props: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      {...(caps ? { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const } : {})}
      {...props}
    >
      {inner}
    </svg>
  );
  return Render;
};

const filled = (inner: React.ReactNode): IconRenderer => {
  const Render = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      {inner}
    </svg>
  );
  return Render;
};

const ICONS = {
  flame: stroke(
    <path d="M12 2c1.5 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C7 8 6 9.8 6 12a6 6 0 0 0 12 0c0-4.5-3.5-7-6-10Z" />,
  ),
  bolt: stroke(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />),
  ai: stroke(
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 7V4M9 3h6M8.5 12v2M15.5 12v2" />
      <path d="M2 12v2M22 12v2" />
    </>,
  ),
  trophy: stroke(
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3M9 19h6M10 15.5V19M14 15.5V19M8 22h8" />
    </>,
  ),
  users: stroke(
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3.2 3.2 0 0 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9" />
    </>,
  ),
  target: stroke(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" />
    </>,
  ),
  chart: stroke(<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7M20 16v-2" />),
  book: stroke(
    <>
      <path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V5Z" />
    </>,
  ),
  check: stroke(<path d="m4 12 5 5L20 6" />, { width: 2.4 }),
  plus: stroke(<path d="M12 5v14M5 12h14" />, { width: 2.2, caps: false }),
  play: filled(<path d="M7 5v14l12-7-12-7Z" />),
  arrow: stroke(<path d="M14 5l-7 7 7 7M19 12H7" />, { width: 2 }),
  medal: stroke(
    <>
      <path d="M8 3 12 9 16 3M7 14a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z" />
      <path d="m12 12 1 2 2 .2-1.4 1.4.4 2-2-1-2 1 .4-2L11 14l1-2Z" />
    </>,
  ),
  crown: filled(<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8Z" />),
  star: filled(<path d="m12 3 2.6 5.6L20 9.2l-4 4 1 5.8L12 16l-5 3 1-5.8-4-4 5.4-.6L12 3Z" />),
  shield: stroke(
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>,
  ),
  sparkle: filled(
    <path d="M12 2c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z" />,
  ),
  route: stroke(
    <>
      <circle cx="6" cy="19" r="2.4" />
      <circle cx="18" cy="5" r="2.4" />
      <path d="M8.5 19H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.5" />
    </>,
  ),
  apple: filled(
    <path d="M16 13c0-3 2.4-4.4 2.5-4.5-1.4-2-3.5-2.3-4.2-2.3-1.8-.2-3.5 1-4.4 1-.9 0-2.3-1-3.8-1C4.2 6.2 2.5 7.3 1.6 9c-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.5-.9 1.7 0 2.1.9 3.5.9 1.5 0 2.4-1.3 3.3-2.6.7-1 1.3-2.1 1.6-3.2-.1 0-3.1-1.2-3.3-4.8M13.5 4.5c.8-1 1.3-2.3 1.2-3.5-1.1.1-2.5.8-3.3 1.7-.7.8-1.4 2.1-1.2 3.3 1.3.1 2.6-.6 3.3-1.5" />,
  ),
  android: filled(
    <path d="M6 9v8a1.5 1.5 0 0 0 1.5 1.5H8V21a1.5 1.5 0 0 0 3 0v-2.5h2V21a1.5 1.5 0 0 0 3 0v-2.5h.5A1.5 1.5 0 0 0 18 17V9H6Zm-2 0a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 3 0v-4A1.5 1.5 0 0 0 4 9Zm16 0a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 3 0v-4A1.5 1.5 0 0 0 20 9ZM7.5 8h9a4.5 4.5 0 0 0-2.2-3.6l1-1.7a.4.4 0 1 0-.7-.4l-1.1 1.8a5.4 5.4 0 0 0-4 0L8.4 2.3a.4.4 0 1 0-.7.4l1 1.7A4.5 4.5 0 0 0 7.5 8Zm2-1.6a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm5 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z" />,
  ),
  x: filled(
    <path d="M18.2 3H21l-6.5 7.4L22 21h-6l-4.7-6-5.3 6H3l7-7.9L2 3h6.2l4.2 5.5L18.2 3Zm-2.1 16h1.6L8 4.6H6.3L16.1 19Z" />,
  ),
  ig: stroke(
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </>,
    { caps: false },
  ),
  tg: filled(
    <path d="M21.8 4.3 3.4 11.4c-.9.4-.9 1.6 0 1.9l4.6 1.4 1.8 5.6c.2.6 1 .8 1.5.3l2.6-2.4 4.8 3.5c.6.4 1.4.1 1.6-.6l3-14.4c.2-.9-.7-1.7-1.5-1.4ZM9.6 14.3l8-5.2-6.6 6.3-.2 3.1-1.2-4.2Z" />,
  ),
  yt: filled(
    <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18.2 5.6 12 5.6 12 5.6s-6.2 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.7.5 7.9.5 7.9.5s6.2 0 7.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.4 12 31 31 0 0 0 22 8.2ZM10 15V9l5.2 3L10 15Z" />,
  ),

  mail: stroke(
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3 8 9 6 9-6" />
    </>,
  ),
  eye: stroke(
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  ),
  'eye-off': stroke(
    <path d="m2 2 20 20M6.7 6.7A9.7 9.7 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.3-1.7M10.5 10.5a3 3 0 0 0 4 4M9 4.24A9.8 9.8 0 0 1 12 4c6.4 0 10 7 10 7a17.4 17.4 0 0 1-1.8 2.9" />,
  ),
  back: stroke(<path d="M12 4l-8 8 8 8M20 12H4" />, { width: 2 }),
  user: stroke(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </>,
  ),
  phone: stroke(
    <>
      <rect x="5" y="2" width="14" height="20" rx="4" />
      <path d="M12 18h.01" />
    </>,
  ),
  lock: stroke(
    <>
      <rect x="3" y="11" width="18" height="11" rx="3" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>,
  ),
  gift: stroke(
    <>
      <rect x="3" y="9" width="18" height="13" rx="2" />
      <path d="M3 13h18M12 9V22M8 9a4 4 0 0 1 4-4m0 0a4 4 0 0 1 4 4" />
    </>,
  ),
  'arrow-left': stroke(<path d="m15 18-6-6 6-6" />, { width: 2 }),

  'home-f': filled(
    <path d="M10.55 2.53a2 2 0 0 1 2.9 0l7 7.56A2 2 0 0 1 21 11.56V20a2 2 0 0 1-2 2h-4v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5H5a2 2 0 0 1-2-2v-8.44a2 2 0 0 1 .55-1.47l7-7.56Z" />,
  ),
  'user-f': filled(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7Z" />
    </>,
  ),
  bell: stroke(<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />),
  send: stroke(
    <>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </>,
    { width: 2 },
  ),
  heart: stroke(
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
  ),
  msg: stroke(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
  share: stroke(
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </>,
  ),
  clock: stroke(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
  ),
  settings: stroke(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>,
  ),
  logout: stroke(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />, {
    width: 1.8,
  }),

  home: stroke(<path d="M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />),
  'trophy-line': stroke(
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3M9 19h6M10 15.5V19M14 15.5V19M8 22h8" />
    </>,
  ),
  'users-f': filled(
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0H3.5ZM19.2 5.5a3.2 3.2 0 1 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9" />
    </>,
  ),
  'book-f': filled(<path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20V2H6.5Z" />),
} satisfies Record<string, IconRenderer>;

export type IconName = keyof typeof ICONS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;

  size?: number;
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  const Render = ICONS[name];
  return <Render width={size} height={size} aria-hidden {...props} />;
}
