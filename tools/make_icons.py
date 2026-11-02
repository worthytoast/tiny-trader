"""Draws the Tiny Trader icon (same design as the adaptive vector), launcher PNGs, and the Play feature graphic."""
import pathlib
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path(__file__).resolve().parent.parent
YEL, INK, GREEN, WHITE, PAPER, GRID = "#ffe45c", "#1b2a4a", "#109e55", "#ffffff", "#f7f9ff", "#e3e9f8"

def icon(px, bg=YEL):
    s = px / 108
    im = Image.new("RGBA", (px, px), bg); d = ImageDraw.Draw(im)
    S = lambda *v: [x * s for x in v]
    d.rounded_rectangle(S(28, 30, 80, 78), radius=6 * s, fill=WHITE, outline=INK, width=max(1, round(3 * s)))
    d.line(S(36, 66, 47, 56, 55, 61, 72, 42), fill=GREEN, width=max(2, round(5 * s)), joint="curve")
    for x, y in ((36, 66), (47, 56), (55, 61)):
        r = 2.5; d.ellipse(S(x - r, y - r, x + r, y + r), fill=GREEN)
    d.polygon(S(64, 40, 74, 38, 72, 48), fill=GREEN)
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

fg = Image.new("RGB", (1024, 500), PAPER); d = ImageDraw.Draw(fg)
for x in range(0, 1024, 32): d.line([(x, 0), (x, 500)], fill=GRID)
for y in range(0, 500, 32): d.line([(0, y), (1024, y)], fill=GRID)
f = ImageFont.truetype(str(root / "tools/LilitaOne.ttf"), 112); f2 = ImageFont.truetype(str(root / "tools/LilitaOne.ttf"), 34)
d.text((70, 100), "Tiny", font=f, fill=INK)
d.rectangle((66, 300, 470, 340), fill=YEL)
d.text((70, 215), "Trader", font=f, fill=INK)
d.text((74, 380), "Pretend money. Real fun.", font=f2, fill="#5d6b8a")
pts = [(560, 400), (640, 330), (700, 360), (780, 250), (840, 280), (950, 120)]
d.line(pts, fill=GREEN, width=14, joint="curve")
for p in pts[:-1]: d.ellipse((p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9), fill=GREEN)
d.polygon([(915, 110), (968, 100), (958, 152)], fill=GREEN)
fg.save(store / "feature-graphic-1024x500.png")
print("icons done")
