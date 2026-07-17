# @composition

Startup wiring only. Sets one adapter per port in the `@ports` registry, exactly once, before the app renders (`src/index.tsx` imports `@composition` for its side effect ahead of `render`).

## Rules

1. No logic beyond wiring. No signals, no JSX, no conditionals except environment detection.
2. Environment detection lives here (future): Tauri present → wire Tauri adapters; otherwise → HTTP adapters for the web build. Nothing outside this layer may know which backend is active.
3. If wiring grows (providers, context mounting), it stays a thin, readable stack in one place — never scatter port setup across interface files.
