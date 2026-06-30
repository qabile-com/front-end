export function PhoenixArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden role="img" fill="none">
      <defs>
        <linearGradient
          id="phx-body"
          x1="200"
          y1="40"
          x2="200"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff2a1" />
          <stop offset="0.28" stopColor="#f3ba63" />
          <stop offset="0.6" stopColor="#ff6200" />
          <stop offset="1" stopColor="#cc4308" />
        </linearGradient>
        <linearGradient
          id="phx-wing"
          x1="60"
          y1="120"
          x2="340"
          y2="240"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#cc4308" />
          <stop offset="0.5" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#f3ba63" />
        </linearGradient>
        <radialGradient id="phx-core" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#fff2a1" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff6200" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="190" rx="150" ry="160" fill="url(#phx-core)" />

      <g fill="url(#phx-wing)">
        <path
          d="M196 150
          C150 110 96 96 54 116
          c34 6 58 24 74 46
          C104 196 70 196 36 184
          c30 26 66 38 102 34
          C118 246 86 264 60 296
          c44 -10 84 -34 116 -70
          C182 214 190 182 196 150 Z"
        />
        <path
          d="M204 150
          C250 110 304 96 346 116
          c-34 6 -58 24 -74 46
          C296 196 330 196 364 184
          c-30 26 -66 38 -102 34
          C282 246 314 264 340 296
          c-44 -10 -84 -34 -116 -70
          C218 214 210 182 204 150 Z"
        />
      </g>

      <g fill="url(#phx-body)">
        <path d="M200 250 c-14 36 -30 60 -22 104 c10 -20 18 -34 22 -44 c4 10 12 24 22 44 c8 -44 -8 -68 -22 -104 Z" />
        <path
          d="M200 256 c-26 30 -48 52 -52 92 c18 -16 32 -30 44 -44 c-2 14 -4 30 -2 44 c18 -34 24 -62 10 -92 Z"
          opacity="0.85"
        />
        <path
          d="M200 256 c26 30 48 52 52 92 c-18 -16 -32 -30 -44 -44 c2 14 4 30 2 44 c-18 -34 -24 -62 -10 -92 Z"
          opacity="0.85"
        />
      </g>

      <path
        fill="url(#phx-body)"
        d="M200 56
          c-10 14 -20 24 -22 42
          c-2 16 6 28 6 44
          c-8 14 -14 28 -14 46
          c0 26 14 44 30 60
          c16 -16 30 -34 30 -60
          c0 -18 -6 -32 -14 -46
          c0 -16 8 -28 6 -44
          c-2 -18 -12 -28 -22 -42 Z"
      />
      <path
        fill="url(#phx-body)"
        d="M200 50 c6 -14 16 -22 30 -26 c-8 8 -10 18 -10 28 c10 -4 20 -4 30 -2 c-14 6 -22 14 -28 24 c-8 -10 -14 -16 -22 -24 Z"
      />
      <circle cx="200" cy="104" r="5" fill="#1a0a00" />
    </svg>
  );
}
