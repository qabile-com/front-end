# `shared/` — the design system (shared presentation)

Reusable, **feature-agnostic** UI. A `Button` here knows nothing about "auth" or "chat".

- `ui/` — shadcn/ui components live here (you own this code — see Step 6).
- `components/` — your own composed reusable components (e.g. `PageHeader`, `EmptyState`).
- `hooks/` — generic React hooks (e.g. `useDisclosure`, `useMediaQuery`). Not feature logic.

**Import rule:** `shared` may import `shared` and `core` only. It must NOT import any feature —
if a component needs feature knowledge, it belongs in that feature's `presentation/`, not here.
