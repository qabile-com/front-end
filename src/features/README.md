# `features/` — one folder per feature, layered inside

Each feature is a vertical slice of the app (e.g. `auth/`, `chat/`, `profile/`).
Inside every feature, the four layers repeat:

```
features/<name>/
  domain/          # entities, value objects, repository INTERFACES (the contracts)
  application/     # use-cases + React Query hooks; orchestrates domain + infra
  infrastructure/  # repository IMPLEMENTATIONS, DTOs, mappers, API calls
  presentation/    # React components & screens for THIS feature
  index.ts         # PUBLIC API — the only door. Other features import from here, never deeper.
```

## The two rules that keep features from becoming spaghetti

1. **Dependency Rule (within a feature):** presentation → application → domain ← infrastructure.
   Inner never imports outer. Enforced by `eslint-plugin-boundaries`.

2. **Public-API Rule (between features):** a feature exposes only what it re-exports from its
   `index.ts`. Feature A imports `@/features/b`, never `@/features/b/infrastructure/...`.
   This lets you refactor a feature's internals freely without breaking other features.

When in doubt: "Could I delete this whole feature folder and only break its own routes?"
If yes, your boundaries are healthy.
