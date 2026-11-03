# Tiny Trader

A day-trading learning game played with pretend money, with two modes. Simple mode trades one market, the Tiny Market (all six made-up companies rolled into one price, like an index fund), on a live line chart with one big BUY / SELL button that trades 10 shares at a time. Its Trading School teaches seven real techniques one at a time (buy low / sell high, moving average, support and resistance, take-profit and stop-loss, trading the news, candlesticks, position sizing): each lesson adds its tool to the chart and gives a task to practice it, and a live coach line says what the tools show. Pro mode (in Settings) adds six companies, share amounts, owning several at once, stop-loss, overnight holding, and a fuller chart. Both modes trade in one shared market (same companies, same prices, same clock), and each mode keeps its own $10,000 and its own shares. Both modes have a daily goal that earns stars and ranks, win streaks, sound effects, and a 1x/2x/3x speed button.

- **Play in a browser:** https://worthytoast.github.io/tiny-trader/
- **Android app:** `android/` builds a signed Play Store bundle (`.aab`) that runs the same game offline.

## How it is built

The whole game is one HTML file, `src/game.html`, with no libraries. Everything else is generated from it.

| Command | What it does |
|---|---|
| `python tools/build.py` | Writes `docs/index.html` (web), `android/app/src/main/assets/index.html` (app), and `dist/artifact.html` (claude.ai copy). Run after every change to `src/game.html`. |
| `bash tools/build_android.sh` | Signed `tiny-trader-<version>.aab` and `.apk` in `release/`. |
| `python tools/make_icons.py` | Launcher icons, the 512 px store icon, and the feature graphic. |
| `node tools/sim.js docs/index.html` | Headless test: plays hundreds of days tick by tick with several strategies and checks the trading rules. |
| `node tools/ui_test.js` | Browser test of the one-market Simple screen, Trading School (lesson cards, tasks, the lesson list), the loss card, its two buttons, Settings, Start over, Pro mode (share amounts, several holdings, stop-loss, separate money), and the goal bar, speed button, Sounds switch, money pop-up, and rank on the day card (needs the same local server as below). |
| `node tools/shoot.js` | Retakes the 1080 x 1920 store screenshots (needs `python -m http.server 8800 --directory docs` running). |

The Android toolchain lives outside the repo in `C:\Users\liamb\tools\android` (JDK 17, Android SDK 36, Gradle 8.11.1). It is shared with the Wall Hop project.

## Signing key

The upload key is **not** in this repo. It lives in `C:\Users\liamb\Liams_projects\tiny-trader-signing\` with its passwords. Back that folder up.

## Publishing an update

1. Edit `src/game.html` and run `python tools/build.py`.
2. Raise `versionCode` and `versionName` in `android/app/build.gradle`.
3. Run `bash tools/build_android.sh` and upload the new `.aab` in Play Console.

See `store/listing.md` for listing text and Play Console form answers.
