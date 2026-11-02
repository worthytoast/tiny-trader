# Tiny Trader: notes for Claude

Read README.md first for build commands.

- `src/game.html` is the only source. `__LILITA__` is replaced with the base64 Lilita One font at build time. Never hand-edit `docs/index.html` or the Android asset copy.
- `window.__tt` exposes state and actions for the headless test and screenshot script. `window.appBack()` is called by the Android Back button.
- Save data: localStorage key `tinytrader.v4` holding `{games:{simple,pro}, mode, best:{simple,pro}, seenIntro, seenPro, opts}`. Each mode has its own separate game and money. A v3 save is migrated into `games.simple` on first load.
- Holdings are `s.hold = {TICKER: {sh, cost, at, bad, good, stop}}` in both modes.
- Simple mode: three stocks (`simple:1` in `ALL`), at most one holding, and one button (`act()`) that is all-in BUY or full SELL. Anything held at 4:00 is sold automatically.
- Pro mode (Settings > Game mode): all six stocks plus market-wide news, share amounts 1/10/100/Max, separate BUY and SELL, several holdings at once, a per-holding stop-loss (Off/3/5/10% below average cost, checked every tick), shares kept overnight, and a chart with price labels, volume bars, and an "open" marker. A one-time Pro intro card appears the first time Pro is chosen.
- Live engine: `tick()` runs every 1000 ms (slowed down at the user's request; was 300 ms) and is one market minute; a day is 390 ticks; candles are 5 minutes. Per-minute noise is `vol*.09` with volatility drag removed. News hits about 8 times a day: 75% of the move lands at once, then it drifts on or fades back (30% chance). Every simple strategy, including a news-chaser, has a median day near zero. Rerun `tools/sim.js` after changing any of this.
- Loss lessons: after any sale that loses money (including the 4:00 auto-sale), a card explains why in simple words and how to make money. The reason is picked in order: bad news hit the stock while held, the 4:00 close, a sell within 3 minutes, a wild stock, or plain risk. "Remind me again" keeps the cards on; "Dismiss" turns them off. Settings (header button) has the on/off switch, saved in `opts.explain`, plus Start over (needs two taps). The game pauses while either is open.
- A day in progress reloads paused. The game pauses itself when the app goes to the background.
- Keep it super simple. That was the user's main request. No real tickers, no real companies, no real money, no investing advice.
- Android wrapper: plain `Activity` + `WebView` with system bars visible and padded (Android 15+ forces edge to edge). Package `com.worthytoast.tinytrader`, target SDK 36.

## Status (Nov 2, 2026)

- Version 1.0 built and signed. Not uploaded to Play yet; needs a Play Console developer account (an adult's).
- Nov 2, 2026: the user asked for it to feel like day trading with "the bar graph that constantly changes", so the turn-based Next Day version became the live candlestick version. Then they said "make it more simple": six stocks became three, share amounts and the 5-day week were removed, and trading became one all-in BUY/SELL button.
- Then: slowed to 1 tick per second; loss-explanation cards with Dismiss / Remind me again and a Settings switch; then "make in there a more complex mode" added Pro mode alongside Simple.
- This replaced Wall Hop as the game the user wants on the Play Store. Wall Hop still exists in its own repo.
