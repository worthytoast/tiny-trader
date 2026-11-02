# Tiny Trader: notes for Claude

Read README.md first for build commands.

- `src/game.html` is the only source. `__LILITA__` is replaced with the base64 Lilita One font at build time. Never hand-edit `docs/index.html` or the Android asset copy.
- `window.__tt` exposes state and actions for the headless test and screenshot script. `window.appBack()` is called by the Android Back button.
- Save data: localStorage key `tinytrader.v3` holding `{s, best, seenIntro}`. (v1 was turn-based, v2 the 6-stock 5-day-week version.)
- Rules: three stocks. You hold at most one at a time (`s.own`), and BUY spends all your cash on it while SELL sells all of it. One button toggles between them. At 4:00 PM anything held is sold automatically. Days repeat forever; money carries over; `best` is the highest total ever.
- Live engine: `tick()` runs every 1000 ms (slowed down at the user's request; was 300 ms) and is one market minute; a day is 390 ticks; candles are 5 minutes. Per-minute noise is `vol*.09` with volatility drag removed. News hits about 8 times a day: 75% of the move lands at once, then it drifts on or fades back (30% chance). Every simple strategy, including a news-chaser, has a median day near zero. Rerun `tools/sim.js` after changing any of this.
- Loss lessons: after any sale that loses money (including the 4:00 auto-sale), a card explains why in simple words and how to make money. The reason is picked in order: bad news hit the stock while held, the 4:00 close, a sell within 3 minutes, a wild stock, or plain risk. "Remind me again" keeps the cards on; "Dismiss" turns them off. Settings (header button) has the on/off switch, saved in `opts.explain`, plus Start over (needs two taps). The game pauses while either is open.
- A day in progress reloads paused. The game pauses itself when the app goes to the background.
- Keep it super simple. That was the user's main request. No real tickers, no real companies, no real money, no investing advice.
- Android wrapper: plain `Activity` + `WebView` with system bars visible and padded (Android 15+ forces edge to edge). Package `com.worthytoast.tinytrader`, target SDK 36.

## Status (Nov 2, 2026)

- Version 1.0 built and signed. Not uploaded to Play yet; needs a Play Console developer account (an adult's).
- Nov 2, 2026: the user asked for it to feel like day trading with "the bar graph that constantly changes", so the turn-based Next Day version became the live candlestick version. Then they said "make it more simple": six stocks became three, share amounts and the 5-day week were removed, and trading became one all-in BUY/SELL button.
- This replaced Wall Hop as the game the user wants on the Play Store. Wall Hop still exists in its own repo.
