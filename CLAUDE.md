# Tiny Trader: notes for Claude

Read README.md first for build commands.

- `src/game.html` is the only source. `__LILITA__` is replaced with the base64 Lilita One font at build time. Never hand-edit `docs/index.html` or the Android asset copy.
- `window.__tt` exposes state and actions for the headless test and screenshot script. `window.appBack()` is called by the Android Back button.
- Save data: localStorage key `tinytrader.v2` holding `{s, best, seenIntro}`. (v1 was the old turn-based version.) Changing the shape of `s` needs a migration.
- Live engine: `tick()` runs every 300 ms and is one market minute; a day is 390 ticks (9:30 to 4:00), candles are 5 minutes, and a week is 5 days. Per-minute noise is `vol*.09` with volatility drag removed. News hits about 9 times a day: 75% of the move lands at once, then it drifts on or fades back (30% chance). Tuned so every simple strategy, including a fast news-chaser, has a median week near zero with big swings. Rerun `tools/sim.js` after changing any of this.
- A day in progress reloads paused. The game pauses itself when the app goes to the background.
- Keep it super simple. That was the user's main request. No real tickers, no real companies, no real money, no investing advice.
- Android wrapper: plain `Activity` + `WebView` with system bars visible and padded (Android 15+ forces edge to edge). Package `com.worthytoast.tinytrader`, target SDK 36.

## Status (Nov 2, 2026)

- Version 1.0 built and signed. Not uploaded to Play yet; needs a Play Console developer account (an adult's).
- Nov 2, 2026: the user asked for it to feel like day trading with "the bar graph that constantly changes", so the turn-based Next Day version became the live candlestick version.
- This replaced Wall Hop as the game the user wants on the Play Store. Wall Hop still exists in its own repo.
