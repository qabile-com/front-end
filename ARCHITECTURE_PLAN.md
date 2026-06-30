# Qabile — Architecture & Learning Plan

> A living document. We build incrementally; this explains the _why_ behind every choice.
> Audience: a mid-level frontend dev learning to think like a senior + learning Clean Architecture.

---

## 1. The senior mindset (read this first)

A senior is not someone who knows more APIs. A senior is someone who:

1. **Makes decisions with explicit tradeoffs.** Every "yes" is a "no" to something else. We write the rejected alternative down.
2. **Defers decisions that don't need to be made yet** — and structures code so deferring is cheap (e.g. our chat-bot type is undecided, and that's _fine_ because of boundaries).
3. **Optimizes for change, not for cleverness.** Code is read and modified 10x more than it's written. Boring, predictable structure wins.
4. **Enforces rules with tooling, not willpower.** Conventions that rely on humans remembering them rot. We use ESLint/TS to _make bad architecture fail the build_.
5. **Knows the difference between principles and dogma.** Clean Architecture is principles. Copying a backend folder layout onto a frontend is dogma.

---

## 2. Confirmed decisions

| Area            | Choice                                  | Why                                                                      | Rejected alternative                                |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| Platform        | Web first, Telegram later               | Don't pay for Telegram complexity now; isolate it behind a boundary      | Telegram-first (premature)                          |
| Backend         | Separate API (we are a pure client)     | Business logic isn't ours here; we structure the _client_ cleanly        | Next.js full-stack (we don't own the data)          |
| Chat bot        | Undecided, module boundary reserved     | Defer safely; architecture allows it                                     | Picking now (premature commitment)                  |
| Framework       | Next.js **App Router** + **TypeScript** | Modern default, RSC-ready, types enforce boundaries                      | Pages Router (legacy), JS (no boundary enforcement) |
| Styling         | **Tailwind** + **shadcn/ui**            | Fast; shadcn = you _own_ the component code (fits "own your details")    | CSS Modules (verbose), MUI (you don't own it)       |
| Package manager | **pnpm**                                | Fast, strict (no phantom deps — catches hidden coupling), disk-efficient | npm (slower, looser), yarn                          |

---

## 3. What "Clean Architecture" means HERE (frontend, pure client)

Two different things share the name:

- **Backend Clean Architecture (Uncle Bob):** entities hold business rules; DB & web are outer "details." Fits when _you own the logic + data_.
- **Frontend Clean Architecture (us):** business logic mostly lives on a server we call. So our goal shifts to: **keep React independent from data-fetching, API shapes, and platform (Telegram).**

The enemy on the frontend is **the framework and API shapes leaking everywhere**, not "the database leaking in."

### Our layers (dependencies point INWARD only)

```
Presentation  → React components, Next pages/routes. Knows nothing about axios or API JSON shapes.
Application   → use-cases, app services, React Query hooks. Orchestrates. UI-facing logic.
Domain        → entities, value objects, plain TypeScript. Framework-free. The "truth."
Infrastructure→ API clients, Telegram SDK, localStorage. The swappable "details."
```

**The one rule (Dependency Rule):** inner layers never import from outer layers.

- Domain imports nothing from the app (no React, no axios).
- Presentation never imports Infrastructure directly — it goes through Application.
- We enforce this with an **ESLint boundaries plugin**, so violating it _fails the build_.

### How data crosses a boundary (the key trick: DTO → Domain mapping)

The API returns JSON (a **DTO** — Data Transfer Object). We do NOT let that shape spread into the UI.
Infrastructure maps `DTO → Domain entity` at the edge. If the API renames a field tomorrow,
we change ONE mapper, and the UI never notices. That's the entire payoff of the architecture.

---

## 4. Folder structure (feature-first + layered inside)

We combine two ideas: **organize by feature** (not by file-type), and **layer inside each feature**.
Pure "by type" folders (all components together, all hooks together) don't scale — a senior groups by _what changes together_.

```
src/
  app/                      # Next.js App Router (routing ONLY — thin)
    layout.tsx
    page.tsx
    (routes...)/
  core/                     # cross-cutting, framework-agnostic foundations
    domain/                 # shared value objects, base types, Result type
    config/                 # env parsing (validated), constants
    lib/                    # pure utilities (no React)
  shared/                   # shared PRESENTATION (design system)
    ui/                     # shadcn components live here (you own them)
    components/             # your own reusable components
    hooks/                  # generic React hooks
  features/
    <feature>/              # e.g. auth, chat, profile
      domain/               # entities, value objects, repository INTERFACES
      application/          # use-cases, query/mutation hooks, mappers usage
      infrastructure/       # repository IMPLEMENTATIONS, DTOs, mappers, API calls
      presentation/         # components + screens for this feature
      index.ts              # the feature's PUBLIC API (barrel) — controls coupling
  providers/                # React context providers (query client, theme, etc.)
  test/                     # test utils, setup
```

Why `index.ts` per feature? It's the feature's **public contract**. Other features import from
`features/chat` — never from deep inside it. This is how we stop spaghetti coupling.

---

## 5. The dependency stack (what we install and WHY)

### Runtime

- **next, react, react-dom** — the framework.
- **@tanstack/react-query** — server-state management. THE most important choice. Server state
  (data from the API) is fundamentally different from UI state. React Query owns caching,
  refetching, loading/error. It becomes our Application-layer data engine.
- **zustand** — _client_ state (UI state: modals, theme, local chat draft). Tiny, unopinionated,
  no boilerplate. We deliberately separate it from server state. (Rejected: Redux — too much
  ceremony for our needs; we'll discuss when Redux WOULD be right.)
- **zod** — runtime validation + TypeScript types from one schema. We validate env vars AND
  API responses at the boundary. "Parse, don't trust" — a senior never trusts external data.
- **axios** (or fetch wrapper) — HTTP client, lives ONLY in infrastructure.

### Dev / quality (the "senior" tooling most tutorials skip)

- **typescript** — strict mode on. Non-negotiable.
- **eslint** + **eslint-plugin-boundaries** — enforces the Dependency Rule automatically.
- **prettier** — formatting (stop arguing about it; automate it).
- **husky** + **lint-staged** — git hooks: run lint/format on commit so bad code never lands.
- **vitest** + **@testing-library/react** — fast unit/component tests.
- **commitlint** (optional) — enforce conventional commit messages.

---

## 6. Build order (incremental — each step is teachable)

1. Scaffold Next.js (App Router + TS + Tailwind). ← project boots
2. Add pnpm config, strict TS, Prettier, ESLint base. ← quality floor
3. Create the folder skeleton + ESLint boundaries. ← architecture enforced
4. Env config with zod (typed, validated). ← "parse don't trust"
5. Infrastructure: typed HTTP client + error model. ← the API boundary
6. shadcn/ui setup + a couple base components. ← design system seed
7. Providers: React Query + Zustand + theme. ← app shell
8. First real feature end-to-end (likely `auth` or a ← prove the architecture
   simple `home`) showing DTO→Domain→hook→component.
9. Git hooks (husky/lint-staged), CI later. ← automation
10. Then: layer in features, and reserve the chat boundary.

We do these ONE at a time. After each, you'll understand it before we move on.

---

## 7. Open questions to revisit later

- Auth mechanism of the separate backend (JWT? cookies? Telegram initData later).
- Chat bot type (AI/support/realtime) — decided when we reach that feature.
- Deployment target (Vercel? self-host?) — affects env & image config.
- i18n / RTL? (the name "Qabile" may imply Arabic/Persian audience — worth confirming.)
