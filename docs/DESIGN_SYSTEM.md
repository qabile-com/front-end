# قبیله ققنوس (Phoenix Tribe) — Design System Reference

> Extracted from the Claude design export `Qabile Landing Page-standalone-src.html`.
> This is the source of truth for tokens. The Tailwind theme in `globals.css` mirrors these.
> Persian (fa), RTL, premium dark theme. Fonts: **IRANYekanX** + **Vazirmatn** (300–900).

## Design tokens (`:root`)

```css
/* surfaces — richer near-black */
--bg: #050302; /* page background */
--bg-2: #0a0604;
--panel: #0e0806;

/* text (ink) */
--ink: #fdf6ef; /* default text */
--ink-2: rgba(253, 238, 226, 0.6);
--ink-3: rgba(253, 238, 226, 0.36);
--ink-4: rgba(253, 238, 226, 0.22);

/* fire / gold (brand) */
--ember: #ff6200; /* PRIMARY accent */
--ember-deep: #cc4308;
--flame: #ff7a1a;
--gold: #f3ba63;
--gold-lite: #fff2a1;
--fire-grad: linear-gradient(135deg, #cc4308 0%, #ff6200 42%, #ffa04d 74%, #f3ba63 100%);
--gold-grad: linear-gradient(135deg, #ffd98a, #f3ba63 45%, #cc4308);

/* glass */
--glass-blur: 20px;
--glass-alpha: 0.042;
--glass: rgba(255, 160, 100, 0.042);
--glass-2: rgba(255, 160, 100, 0.0924);
--hair: rgba(255, 130, 50, 0.13); /* hairline border */
--hair-2: rgba(255, 130, 50, 0.36);

/* glow */
--glow: rgba(255, 98, 0, 0.26);
--glow-2: rgba(255, 98, 0, 0.09);

/* geometry */
--r-sm: 10px;
--r: 16px;
--r-lg: 22px;
--r-xl: 30px;
--maxw: 1200px;

/* type */
--font-body: 'IRANYekanX', 'Vazirmatn', 'Tahoma', system-ui, sans-serif;
--font-disp: 'IRANYekanX', 'Vazirmatn', 'Tahoma', system-ui, sans-serif;
--disp-weight: 900;

/* easing */
--ease-out: cubic-bezier(0.2, 0.7, 0.3, 1);
--ease-back: cubic-bezier(0.34, 1.36, 0.64, 1);
```

## Base / global

- body: `background:#050302; color:#fdf6ef; direction:rtl; line-height:1.75; overflow-x:hidden`
- `::selection` → `rgba(255,98,0,.32)` bg, `#fff` text
- custom scrollbar: 10px, ember-tinted thumb `rgba(255,110,30,.18)`
- `scroll-behavior:smooth`; respects `prefers-reduced-motion`

## Fonts (loaded async in original; we self-host/next-font)

- **IRANYekanX** — `https://cdn.jsdelivr.net/npm/@rastikerdar/iran-yekan-x-font@9.0.1/dist/font-face.css`
- **Vazirmatn** — Google Fonts weights `300;400;500;600;700;800;900`
- Both stacks fall back to `Tahoma, system-ui, sans-serif`. Display weight 900.

## Layout

- container `.wrap`: `max-width:1200px; margin:0 auto; padding:0 32px` (≤860px → `0 22px`)
- `section`: `padding:110px 0` (≤860px → `80px 0`); hero `160px 0 90px`
- breakpoints: **1040px**, **860px**, **640px** (max-width queries)
- z-index: bg/embers 0, content 2, nav 100

## Sections in order (landing)

1. **Nav** (fixed, `.scrolled` glass after 24px) — brand + links (امکانات، مسیر رشد، رقابت، دیدگاه‌ها، سؤالات) + CTAs (ورود، شروع رایگان)
2. **Hero** — H1 «از خاکستر، برخیز.» + lead + 2 CTAs + trust row + phoenix image with 3 floating chips
3. **Stats band** — 4 count-up stats (۵۲ هزار+ عضو، ۸۹۰ هزار درس، ۴٫۵ میلیون گفت‌وگو، ۹۸٪ رضایت)
4. **Pillars** (bento 6-col) — نقشه راه‌ها، منتور هوش مصنوعی (chat mock), گیمیفیکیشن، رقابت سالم، انجمن
5. **Roadmap** — 4 steps: جرقه → مسیر → رشد → تحول
6. **Leaderboard** — podium (top 3) + ranked list, current user row highlighted («تو»)
7. **Testimonials** — infinite marquee of 6 cards
8. **App** — mobile app section with 2 phone mockups + store buttons
9. **FAQ** — accordion, 6 Q/A, first open
10. **CTA** — «همین امروز، شعله‌ات را روشن کن» + phoenix watermark
11. **Footer** — 4 cols + socials (اینستاگرام، تلگرام، ایکس، یوتیوب) + «© ۱۴۰۴ قبیله ققنوس»

## Components (key)

- **Button**: `.btn` (radius 12px, weight 700). `.btn-primary` = fire-grad bg, `#1a0a00` text, glow shadow. `.btn-ghost` = glass bg + hairline border.
- **Glass card**: `.glass` = `rgba(255,160,100,.042)` bg, hairline border, `backdrop-filter:blur(20px) saturate(130%)`, gradient inner border via mask.
- **Eyebrow pill**: gold text, glass bg, 100px radius, ember dot.
- **Grad text**: fire-grad clipped to text.
- Full per-component values (chips, podium, lb-row, tcard, phone mock, faq item, etc.) in the extracted spec.

## Assets

- `assets/phoenix.png` — hero illustration + CTA watermark. (Drop into `public/assets/phoenix.png`.)
- 26 inline SVG icons (sprite): i-flame, i-bolt, i-ai, i-trophy, i-users, i-target, i-chart, i-book, i-check, i-plus, i-play, i-arrow, i-medal, i-crown, i-star, i-shield, i-sparkle, i-route, i-apple, i-android, i-x, i-ig, i-tg, i-yt.
- All avatars are CSS gradients (no image files).

## Animations

- `pfloat` (phoenix), `pglow`, `float` (chips), `blink` (typing dots), `marq` (testimonials 54s), `revealIn` (scroll reveal, staggered).
- Ember particle canvas (`#embers`), capped particle count, skipped under reduced-motion.
- Phoenix mouse parallax.

## Notes for the Next.js rebuild

- Numbers use Persian numerals (۰۱۲۳۴۵۶۷۸۹) and `٬` thousands separator.
- Mock data (leaderboard, testimonials, FAQ) lives in JS arrays — in our architecture this becomes
  domain/fixture data, and later real API data via the repository pattern.
- The "tweaks panel" and "print harness" scripts in the export are tooling artifacts — ignore.
