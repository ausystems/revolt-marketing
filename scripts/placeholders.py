"""
Generates on-palette placeholder art for every image slot on the page.
Run: python3 scripts/placeholders.py
Replace the outputs with Revolt's real photography and creatives; the paths are listed in lib/site.ts.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import random, math, os

random.seed(7)
OUT = "public/assets"
INK = (14, 10, 12)
NIGHT = (21, 10, 14)
EMBER = (156, 15, 31)
FLAME = (227, 25, 46)
AMBER = (255, 107, 26)
CORAL = (255, 143, 107)
PAPER = (255, 255, 255)
WASH = (250, 246, 244)
SAND = (238, 226, 220)

def font(size, bold=True):
    return ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", size, index=1 if bold else 0)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def gradient(w, h, stops, angle=90):
    """Linear gradient across the diagonal. stops: [(t, color)]."""
    img = Image.new("RGB", (w, h))
    px = img.load()
    a = math.radians(angle)
    dx, dy = math.cos(a), math.sin(a)
    # project corners to get range
    corners = [(0, 0), (w, 0), (0, h), (w, h)]
    proj = [x * dx + y * dy for x, y in corners]
    lo, hi = min(proj), max(proj)
    # Precompute a 1024-entry LUT for speed.
    lut = []
    for i in range(1024):
        t = i / 1023
        for j in range(len(stops) - 1):
            t0, c0 = stops[j]
            t1, c1 = stops[j + 1]
            if t0 <= t <= t1:
                lut.append(lerp(c0, c1, (t - t0) / max(1e-6, t1 - t0)))
                break
        else:
            lut.append(stops[-1][1])
    for y in range(h):
        for x in range(w):
            t = (x * dx + y * dy - lo) / (hi - lo)
            px[x, y] = lut[int(t * 1023)]
    return img

def glow(img, center, radius, color, alpha=0.6):
    """Soft radial glow composited over img."""
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color + (int(255 * alpha),))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.55))
    base = img.convert("RGBA")
    return Image.alpha_composite(base, layer).convert("RGB")

def grain(img, amount=6):
    w, h = img.size
    noise = Image.effect_noise((w, h), amount).convert("L")
    noise = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, noise, 0.06)

def rounded_panel(size, radius, fill_img, border=(255, 255, 255, 40)):
    w, h = size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    panel = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    panel.paste(fill_img.resize((w, h)).convert("RGBA"), (0, 0), mask)
    d = ImageDraw.Draw(panel)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, outline=border, width=2)
    return panel

def shadowed(base, panel, pos, blur=40, offset=(0, 24), alpha=140):
    w, h = base.size
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    m = panel.split()[3].point(lambda v: int(v * alpha / 255))
    sh.paste((0, 0, 0, 255), (pos[0] + offset[0], pos[1] + offset[1]), m)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    base = Image.alpha_composite(base, sh)
    base.alpha_composite(panel, pos)
    return base

# ---------------------------------------------------------------- hero frame
def hero():
    W, H = 1600, 1200
    bg = gradient(W, H, [(0, (30, 16, 20)), (0.5, NIGHT), (1, (10, 6, 8))], angle=70)
    bg = glow(bg, (W * 0.78, H * 0.18), 520, AMBER, 0.35)
    bg = glow(bg, (W * 0.15, H * 0.95), 560, EMBER, 0.45)
    base = grain(bg).convert("RGBA")
    # Floating creatives, like ad frames caught mid-air.
    panels = [
        ((520, 700), (150, 260), [(0, EMBER), (1, AMBER)], 60),
        ((460, 620), (740, 150), [(0, (40, 22, 28)), (1, (90, 30, 40))], 40),
        ((380, 500), (1120, 420), [(0, AMBER), (1, CORAL)], 30),
        ((420, 560), (520, 560), [(0, SAND), (1, PAPER)], 30),
        ((330, 440), (1000, 720), [(0, (24, 12, 16)), (1, EMBER)], 30),
    ]
    for (size, pos, stops, ang) in panels:
        panel = rounded_panel(size, 28, gradient(size[0], size[1], stops, ang))
        base = shadowed(base, panel, pos)
    d = ImageDraw.Draw(base)
    d.text((120, 120), "REVOLT", font=font(54), fill=(255, 255, 255, 200))
    d.text((120, 186), "Creative in the wild", font=font(28, False), fill=(255, 255, 255, 140))
    base.convert("RGB").save(f"{OUT}/hero/frame.jpg", quality=86, optimize=True, progressive=True)

# ---------------------------------------------------------------- work strip
def creatives():
    palettes = [
        ([(0, EMBER), (1, AMBER)], 75, PAPER),
        ([(0, (24, 12, 16)), (1, (70, 20, 30))], 60, CORAL),
        ([(0, SAND), (1, PAPER)], 80, INK),
        ([(0, AMBER), (1, CORAL)], 100, INK),
        ([(0, NIGHT), (1, EMBER)], 45, PAPER),
        ([(0, WASH), (1, SAND)], 120, FLAME),
        ([(0, FLAME), (1, EMBER)], 70, PAPER),
        ([(0, (40, 22, 28)), (1, NIGHT)], 90, CORAL),
    ]
    words = ["Louder.", "Sold out.", "Try it.", "Not for everyone.", "Again.", "Own it.", "Zero apologies.", "Last call."]
    for i, ((stops, ang, fg), word) in enumerate(zip(palettes, words), 1):
        W, H = 1080, 1920
        img = gradient(W, H, stops, ang)
        img = glow(img, (W * random.uniform(0.2, 0.8), H * random.uniform(0.3, 0.8)), 520, lerp(stops[1][1], PAPER, 0.4), 0.25)
        img = grain(img)
        d = ImageDraw.Draw(img)
        d.text((88, 96), f"{i:02d}", font=font(56), fill=fg)
        d.text((88, 168), "Creative", font=font(36, False), fill=fg)
        # Big word, bottom-left, wrapped by hand for the longest ones.
        f = font(190)
        lines = word.split(" ") if len(word) > 9 else [word]
        y = H - 160 - 200 * len(lines)
        for ln in lines:
            d.text((80, y), ln, font=f, fill=fg)
            y += 200
        img.save(f"{OUT}/work/creative-{i:02d}.jpg", quality=84, optimize=True, progressive=True)

# ---------------------------------------------------------------- voices
def voices():
    tones = [
        [(0, (58, 34, 40)), (1, (28, 16, 20))],
        [(0, (110, 40, 40)), (1, (36, 16, 22))],
        [(0, (80, 60, 58)), (1, (30, 20, 22))],
        [(0, (150, 70, 40)), (1, (44, 20, 22))],
        [(0, (60, 44, 50)), (1, (22, 14, 18))],
        [(0, (120, 48, 56)), (1, (34, 16, 22))],
    ]
    for i, stops in enumerate(tones, 1):
        W, H = 1080, 1920
        img = gradient(W, H, stops, 100)
        # A soft key light where a face would be.
        img = glow(img, (W * 0.5, H * 0.36), 460, (255, 200, 170), 0.35)
        img = grain(img, 8)
        d = ImageDraw.Draw(img)
        d.text((72, 1740), f"Voice {i:02d}", font=font(40, False), fill=(255, 255, 255, 150))
        img.save(f"{OUT}/voices/voice-{i:02d}.jpg", quality=84, optimize=True, progressive=True)

# ---------------------------------------------------------------- people
def people():
    W, H = 1200, 1500
    img = gradient(W, H, [(0, (60, 34, 40)), (1, (22, 12, 16))], 110)
    img = glow(img, (W * 0.35, H * 0.35), 520, (255, 190, 150), 0.35)
    img = glow(img, (W * 0.8, H * 0.9), 500, EMBER, 0.5)
    img = grain(img, 8)
    ImageDraw.Draw(img).text((72, H - 120), "The founders", font=font(40, False), fill=(255, 255, 255, 150))
    img.save(f"{OUT}/people/founders.jpg", quality=84, optimize=True, progressive=True)
    W, H = 1500, 900
    img = gradient(W, H, [(0, (34, 22, 26)), (1, (74, 30, 36))], 20)
    img = glow(img, (W * 0.6, H * 0.4), 520, (255, 170, 130), 0.3)
    img = grain(img, 8)
    ImageDraw.Draw(img).text((72, H - 120), "The team", font=font(40, False), fill=(255, 255, 255, 150))
    img.save(f"{OUT}/people/team.jpg", quality=84, optimize=True, progressive=True)

# ---------------------------------------------------------------- og + icons
def og():
    W, H = 1200, 630
    img = gradient(W, H, [(0, NIGHT), (1, (34, 12, 18))], 20)
    img = glow(img, (W * 0.9, H * 0.9), 420, AMBER, 0.5)
    img = glow(img, (W * 0.1, H * 0.2), 360, EMBER, 0.5)
    d = ImageDraw.Draw(img)
    d.text((80, 200), "Revolt", font=font(140), fill=PAPER)
    d.text((80, 350), "Marketing", font=font(140, False), fill=(255, 255, 255, 180))
    d.text((84, 530), "For the brands that refuse to blend in.", font=font(36, False), fill=(255, 255, 255, 170))
    img.save(f"{OUT}/og-image.png", optimize=True)

def apple_icon():
    S = 180
    img = gradient(S, S, [(0, EMBER), (1, AMBER)], 45)
    d = ImageDraw.Draw(img)
    f = font(120)
    bbox = d.textbbox((0, 0), "R", font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((S - tw) / 2 - bbox[0], (S - th) / 2 - bbox[1] - 4), "R", font=f, fill=PAPER)
    img.save("app/apple-icon.png", optimize=True)

hero(); creatives(); voices(); people(); og(); apple_icon()
print("ok")
