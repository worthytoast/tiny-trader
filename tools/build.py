"""Build Tiny Trader: inlines the font and writes the web page, the claude.ai copy, and the Android asset."""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src" / "game.html").read_text(encoding="utf-8")
font = base64.b64encode((root / "tools" / "LilitaOne.ttf").read_bytes()).decode()
body = src.replace("__LILITA__", font)
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(body, encoding="utf-8")
head, _, rest = body.partition("<style>")
links = '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-512.png">\n'
page = ("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
        + links + head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
        + "<style>" + rest.replace('<div class="app">', '</head>\n<body>\n<div class="app">', 1)
        + "\n</body>\n</html>\n")
(root / "docs").mkdir(exist_ok=True)
(root / "docs" / "index.html").write_text(page, encoding="utf-8")
assets = root / "android" / "app" / "src" / "main" / "assets"
assets.mkdir(parents=True, exist_ok=True)
(assets / "index.html").write_text(page.replace(links, ""), encoding="utf-8")
print("built", len(page) // 1024, "KB")
