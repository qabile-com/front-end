# `core/` — framework-agnostic foundations (the bedrock)

Cross-cutting code that everything may depend on, and that depends on **nothing internal**.
No React, no Next, no axios. Pure TypeScript.

- `config/` — validated environment variables & constants (see Step 4).
- `domain/` — shared value objects / base types used across features (e.g. a `Result` type, `Id`).
- `lib/` — pure utility functions (date, money, string helpers). No side effects, no React.

**Import rule:** `core` may import only `core`. If you find yourself wanting to import React
or a feature here, it doesn't belong in `core`.
