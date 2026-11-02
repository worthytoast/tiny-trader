"""Draws the Tiny Trader icon (same design as the adaptive vector), launcher PNGs, and the Play feature graphic."""
import pathlib
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path(__file__).resolve().parent.parent
YEL, INK, GREEN, WHITE, PAPER, GRID = "#ffe45c", "#1b2a4a", "#109e55", "#ffffff", "#f7f9ff", "#e3e9f8"

def icon(px, bg="#0e1424"):
    s = px / 108
    im = Image.new("RGBA", (px, px), bg); d = ImageDraw.Draw(im)
    S = lambda *v: [x * s for x in v]
    RED, GRN = "#ff5a55", "#22d37f"
    for col, wick, body in ((RED, (35, 50, 37, 74), (31, 56, 41, 68)), (GRN, (49, 44, 51, 68), (45, 48, 55, 62)),
                            (RED, (63, 40, 65, 60), (59, 44, 69, 54)), (GRN, (77, 28, 79, 56), (73, 32, 83, 50))):
        d.rectangle(S(*wick), fill=col); d.rectangle(S(*body), fill=col)
    return im

res = root / "android/app/src/main/res"
for name, px in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    big = icon(px * 108 // 72 + 1); off = (big.width - px) // 2
    out = res / f"mipmap-{name}"; out.mkdir(parents=True, exist_ok=True)
    big.crop((off, off, off + px, off + px)).convert("RGB").save(out / "ic_launcher.png")

store = root / "store"; store.mkdir(exist_ok=True)
big = icon(768); c = (768 - 512) // 2
ic = big.crop((c, c, c + 512, c + 512)).convert("RGB")
ic.save(store / "icon-512.png"); ic.save(root / "docs/icon-512.png"); ic.resize((192, 192), Image.LANCZOS).save(root / "docs/icon-192.png")

import random
random.seed(7)
fg = Image.new("RGB", (1024, 500), "#0e1424"); d = ImageDraw.Draw(fg)
for y in range(60, 500, 60): d.line([(0, y), (1024, y)], fill="#1a2440")
f = ImageFont.truetype(str(root / "tools/LilitaOne.ttf"), 112); f2 = ImageFont.truetype(str(root / "tools/LilitaOne.ttf"), 34)
p = 330.0; x = 520
while x < 1000:
    o = p; p += random.gauss(-4.5, 14); h = min(o, p) - random.uniform(4, 18); l = max(o, p) + random.uniform(4, 18)
    col = "#22d37f" if p <= o else "#ff5a55"
    d.line([(x + 8, h), (x + 8, l)], fill=col, width=3); d.rectangle((x, min(o, p), x + 16, max(o, p) + 2), fill=col)
    x += 24
d.text((60, 110), "Tiny", font=f, fill="#eef2ff"); d.text((60, 225), "Trader", font=f, fill="#22d37f")
d.text((64, 380), "Day trading with pretend money", font=f2, fill="#8c98bd")
fg.save(store / "feature-graphic-1024x500.png")
print("icons done")
