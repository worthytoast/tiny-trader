# Tiny Trader

A super simple day-trading game played with pretend money. Prices tick live on candlestick charts while news pops up. You start with $10,000, trade six made-up companies over a 5-day week (each day is about 2 minutes), and see whether you beat the market average.

- **Play in a browser:** https://worthytoast.github.io/tiny-trader/
- **Android app:** `android/` builds a signed Play Store bundle (`.aab`) that runs the same game offline.

## How it is built

The whole game is one HTML file, `src/game.html`, with no libraries. Everything else is generated from it.

| Command | What it does |
|---|---|
| `python tools/build.py` | Writes `docs/index.html` (web), `android/app/src/main/assets/index.html` (app), and `dist/artifact.html` (claude.ai copy). Run after every change to `src/game.html`. |
| `bash tools/build_android.sh` | Signed `tiny-trader-<version>.aab` and `.apk` in `release/`. |
| `python tools/make_icons.py` | Launcher icons, the 512 px store icon, and the feature graphic. |
| `node tools/sim.js docs/index.html` | Headless test: plays hundreds of weeks tick by tick with several strategies and checks the trading rules. |
| `node tools/shoot.js` | Retakes the 1080 x 1920 store screenshots (needs `python -m http.server 8800 --directory docs` running). |

The Android toolchain lives outside the repo in `C:\Users\liamb\tools\android` (JDK 17, Android SDK 36, Gradle 8.11.1). It is shared with the Wall Hop project.

## Signing key

The upload key is **not** in this repo. It lives in `C:\Users\liamb\Liams_projects\tiny-trader-signing\` with its passwords. Back that folder up.

## Publishing an update

1. Edit `src/game.html` and run `python tools/build.py`.
2. Raise `versionCode` and `versionName` in `android/app/build.gradle`.
3. Run `bash tools/build_android.sh` and upload the new `.aab` in Play Console.

See `store/listing.md` for listing text and Play Console form answers.
