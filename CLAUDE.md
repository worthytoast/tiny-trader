# Tiny Trader: notes for Claude

Read README.md first for build commands.

- `src/game.html` is the only source. `__LILITA__` is replaced with the base64 Lilita One font at build time. Never hand-edit `docs/index.html` or the Android asset copy.
- `window.__tt` exposes state and actions for the headless test and screenshot script. `window.appBack()` is called by the Android Back button.
- Save data: localStorage key `tinytrader.v1` holding `{s, best, seenIntro}`. Changing the shape of `s` needs a migration.
- Price model in `nextDay()`: log-normal daily noise with volatility drag removed, a market-wide move scaled by each stock's `beta`, and news shocks applied as plain percentages with 30% follow-through the next day. This keeps luck balanced: spreading money evenly earns about +6% a season in the median. Rerun `tools/sim.js` after changing any `mu`, `vol`, or shock numbers.
- Keep it super simple. That was the user's main request. No real tickers, no real companies, no real money, no investing advice.
- Android wrapper: plain `Activity` + `WebView` with system bars visible and padded (Android 15+ forces edge to edge). Package `com.worthytoast.tinytrader`, target SDK 36.

## Status (Nov 2, 2026)

- Version 1.0 built and signed. Not uploaded to Play yet; needs a Play Console developer account (an adult's).
- This replaced Wall Hop as the game the user wants on the Play Store. Wall Hop still exists in its own repo.
