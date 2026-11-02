#!/usr/bin/env bash
# Builds the signed Play Store bundle (.aab) and an installable .apk into release/.
set -euo pipefail
cd "$(dirname "$0")/.."
python tools/build.py
export JAVA_HOME="$(cygpath -w "$HOME/tools/android/jdk-x/jdk-17.0.20.1+1")"
[ -f android/local.properties ] || printf "sdk.dir=%s\n" "$(cygpath -m "$HOME/tools/android/sdk")" > android/local.properties
[ -f android/keystore.properties ] || cp ../tiny-trader-signing/keystore.properties android/keystore.properties
(cd android && ./gradlew bundleRelease assembleRelease --no-daemon -q)
ver=$(grep -oE "versionName '[^']+'" android/app/build.gradle | cut -d"'" -f2)
mkdir -p release
cp android/app/build/outputs/bundle/release/app-release.aab "release/tiny-trader-$ver.aab"
cp android/app/build/outputs/apk/release/app-release.apk "release/tiny-trader-$ver.apk"
ls -la release
