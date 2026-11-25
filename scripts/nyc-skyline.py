"""Generate src/components/NycSkyline.jsx: the NYC campus banner's artwork.

    python3 scripts/nyc-skyline.py [preview.svg]

Golden hour over an original, stylized NYC skyline: a posterized sunset sky
with dithered band edges, the Claude spark setting behind the city, detailed
landmark silhouettes (Art Deco setback tower, sunburst-crowned spire, a very
thin supertall, a tapered glass tower), lit windows, and a grain layer over
the whole scene.

All random layers are seeded, so rerunning with no edits reproduces the same
picture. Writes the JSX component, and optionally a standalone SVG preview.
"""
import math
import os
import random
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPARK = re.findall(
    r'd="([^"]+)"',
    open(f"{REPO}/src/assets/brand/claude-spark.svg").read(),
)[0]

X0, X1, H = -320, 960, 360      # wide scene, so the band can crop it freely
BASE = 300                      # street line
rnd = random.Random(1984)

# Palette: sunset, from the club's coral outward.
SKY = ["#24192a", "#2e1d2c", "#3b212c", "#4d262b", "#62302b", "#7a3a2a",
       "#913f29", "#a34a2a", "#b8583a", "#c8664a", "#d97757", "#e48d68",
       "#eda67d", "#f2c79a"]
FAR = "#7a3a2a"
MID = "#3a2126"
MID_EDGE = "#7d453c"
NEAR = "#24161b"
LIT = "#fbe3c4"
LIT_WARM = "#f7b98a"
BEACON = "#ff8a6a"

out = []
add = out.append


def r(x, y, w, h, fill, extra=""):
    add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}"{extra} />')


def windows(x, y, w, h, cols, rows, lit=0.2, warm=0.4, size=(1.8, 2.6), pad=3):
    if cols <= 0 or rows <= 0:
        return
    cw, rh = (w - 2 * pad) / cols, (h - 2 * pad) / rows
    for i in range(rows):
        for j in range(cols):
            if rnd.random() > lit:
                continue
            col = LIT_WARM if rnd.random() < warm else LIT
            r(x + pad + j * cw + (cw - size[0]) / 2, y + pad + i * rh + (rh - size[1]) / 2,
              size[0], size[1], col, f' opacity="{0.5 + rnd.random() * 0.45:.2f}"')


# ---------------------------------------------------------------- defs
DEFS = '''<defs>
  <linearGradient id="nyc-water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#b8583a" />
    <stop offset="1" stopColor="#24192a" />
  </linearGradient>
  <radialGradient id="nyc-sun" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor="#fbe3c4" stopOpacity="0.55" />
    <stop offset="0.6" stopColor="#f2c79a" stopOpacity="0.18" />
    <stop offset="1" stopColor="#f2c79a" stopOpacity="0" />
  </radialGradient>
  <filter id="nyc-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</defs>'''

# ---------------------------------------------------------------- sky: posterized bands, dithered seams
def _lerp(a, b, t):
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(pa, pb))


# 28 discrete bands interpolated through the palette: still visibly stepped,
# like a low-colour-depth image, but fine enough not to read as stripes.
STEPS = 28
SKY = [_lerp(SKY[int(k)], SKY[min(int(k) + 1, len(SKY) - 1)], k - int(k))
       for k in (i * (len(SKY) - 1) / (STEPS - 1) for i in range(STEPS))]
band_h = BASE / len(SKY)
for i, col in enumerate(SKY):
    r(X0, i * band_h, X1 - X0, band_h + 1, col)
# Checkerboard dither along each seam: the next band's colour, in 3px pixels,
# so the steps read as a pixel gradient rather than stripes.
PX = 3
for i in range(1, len(SKY)):
    y = i * band_h
    cells = []
    for row, density in ((-2, 0.15), (-1, 0.5)):
        yy = y + row * PX
        for k, x in enumerate(range(X0, X1, PX)):
            if (k + row) % 2 == 0 and rnd.random() < density * 2:
                cells.append(f"M{x} {yy:.1f}h{PX}v{PX}h-{PX}z")
    add(f'<path d="{"".join(cells)}" fill="{SKY[i]}" />')

# a few early stars up top
for _ in range(30):
    sx, sy = rnd.uniform(X0, X1), rnd.uniform(4, 70)
    r(sx, sy, 1.5, 1.5, LIT, f' opacity="{rnd.uniform(0.25, 0.7):.2f}"')

# ---------------------------------------------------------------- far city
x = X0 - 2
while x < X1:
    w, h = rnd.randint(16, 36), rnd.randint(50, 130)
    r(x, BASE - h, w + 1, h + 1, FAR, ' opacity="0.85"')
    windows(x, BASE - h, w, h, max(1, w // 7), h // 10, lit=0.07, size=(1.6, 2.2))
    x += w


# ---------------------------------------------------------------- sun + spark, in front of the far city, behind the landmarks
SX, SY = 378, 268
add(f'<circle cx="{SX}" cy="{SY}" r="170" fill="url(#nyc-sun)" />')
add(f'<circle cx="{SX}" cy="{SY}" r="74" fill="#f7d7b0" opacity="0.3" />')
add(f'<g transform="translate({SX - 47 * 1.5:.1f} {SY - 47 * 1.5:.1f}) scale(1.5)"><path d="{SPARK}" fill="#fbe3c4" /></g>')

# ---------------------------------------------------------------- landmarks
def empire(cx):
    tiers = [(64, 190), (50, 150), (36, 128), (24, 112), (14, 100)]
    for w, top in tiers:
        r(cx - w / 2, top, w, BASE - top + 1, MID)
        # a lit ledge at each setback, catching the low sun
        r(cx - w / 2, top, w, 1.2, LIT_WARM, ' opacity="0.55"')
    add(f'<path d="M{cx - 5} 100 L{cx - 3} 76 L{cx + 3} 76 L{cx + 5} 100 Z" fill="{MID}" />')
    r(cx - 1, 36, 2, 42, MID)
    add(f'<circle cx="{cx}" cy="36" r="1.8" fill="{BEACON}" />')
    # floodlit crown bands
    for y, w, op in ((104, 12, 0.9), (110, 18, 0.7), (118, 24, 0.55), (124, 26, 0.4)):
        r(cx - w / 2, y, w, 2, LIT_WARM, f' opacity="{op}"')
    # vertical piers running the height of the shaft
    for dx in range(-28, 30, 7):
        r(cx + dx - 0.4, 192, 0.8, BASE - 192, MID_EDGE, ' opacity="0.8"')
    for dx in range(-22, 24, 6):
        r(cx + dx - 0.4, 152, 0.8, 37, MID_EDGE, ' opacity="0.8"')
    windows(cx - 32, 190, 64, BASE - 190, 9, 16, lit=0.28)
    windows(cx - 25, 152, 50, 36, 7, 5, lit=0.3)


def chrysler(cx):
    w = 34
    r(cx - w / 2, 150, w, BASE - 150 + 1, MID)
    r(cx - w / 2 - 9, 214, w + 18, BASE - 214 + 1, MID)
    # the gargoyle corners at the setback
    for sx in (-1, 1):
        x0 = cx + sx * (w / 2 + 9)
        add(f'<path d="M{x0} 214 L{x0 + sx * 6} 210 L{x0} 218 Z" fill="{MID}" />')
    # stacked sunburst domes, each edged and studded with lit triangles
    for rad, base in [(17, 150), (13, 132), (9.5, 117), (6.5, 104)]:
        add(f'<path d="M{cx - rad} {base} A{rad} {rad * 1.15} 0 0 1 {cx + rad} {base} Z" '
            f'fill="{MID}" stroke="{LIT_WARM}" strokeOpacity="0.7" strokeWidth="0.9" />')
        n = 6
        for i in range(n):
            a = math.pi * (1 - (i + 0.5) / n)
            px, py = cx + (rad - 3.2) * math.cos(a), base - (rad - 3.2) * 1.15 * math.sin(a)
            add(f'<path d="M{px - 1.3:.1f} {py + 1.5:.1f} L{px:.1f} {py - 1.7:.1f} L{px + 1.3:.1f} {py + 1.5:.1f} Z" fill="{LIT}" />')
        # sunburst rays inside the arch
        for i in range(7):
            a = math.pi * (i + 0.5) / 7
            add(f'<line x1="{cx:.1f}" y1="{base}" x2="{cx + (rad - 6) * math.cos(a):.1f}" '
                f'y2="{base - (rad - 6) * 1.15 * math.sin(a):.1f}" stroke="{LIT_WARM}" strokeOpacity="0.35" strokeWidth="0.6" />')
    add(f'<path d="M{cx - 3.5} 98 L{cx} 42 L{cx + 3.5} 98 Z" fill="{MID}" stroke="{LIT_WARM}" strokeOpacity="0.6" strokeWidth="0.7" />')
    # vertical brick piers
    for dx in (-12, -4, 4, 12):
        r(cx + dx - 0.4, 152, 0.8, BASE - 152, MID_EDGE, ' opacity="0.8"')
    windows(cx - w / 2, 152, w, BASE - 152, 4, 18, lit=0.3)


def supertall(cx, w, top):
    r(cx - w / 2, top, w, BASE - top + 1, MID)
    # the exposed square grid that defines it
    for y in range(int(top) + 4, BASE, 7):
        r(cx - w / 2, y, w, 0.7, MID_EDGE)
    for dx in (-w / 6, w / 6):
        r(cx + dx - 0.35, top, 0.7, BASE - top, MID_EDGE)
    # open mechanical floors
    for y in (top + 40, top + 110, top + 170):
        r(cx - w / 2 + 1, y, w - 2, 3, LIT_WARM, ' opacity="0.45"')
    windows(cx - w / 2, top, w, BASE - top, 3, int((BASE - top) // 7), lit=0.3, pad=1)


def pencil(cx, w, top):
    r(cx - w / 2, top, w, BASE - top + 1, MID)
    r(cx - w / 2, top, w, 1.2, LIT_WARM, ' opacity="0.6"')
    for y in range(int(top) + 6, BASE, 12):
        r(cx - w / 2, y, w, 0.7, MID_EDGE)
    windows(cx - w / 2, top, w, BASE - top, 2, int((BASE - top) // 8), lit=0.25, pad=2)


def tapered(cx):
    bw, tw, top = 58, 26, 96
    add(f'<path d="M{cx - bw / 2} {BASE + 1} L{cx - tw / 2} {top} L{cx + tw / 2} {top} L{cx + bw / 2} {BASE + 1} Z" fill="{MID}" />')
    # sunlit facet on the west face, shadow facet on the east
    add(f'<path d="M{cx - bw / 2} {BASE + 1} L{cx - tw / 2} {top} L{cx} {BASE + 1} Z" fill="#5a2e2e" />')
    add(f'<path d="M{cx + bw / 2} {BASE + 1} L{cx + tw / 2} {top} L{cx} {BASE + 1} Z" fill="#2c1a20" />')
    add(f'<path d="M{cx - tw / 2} {top} L{cx} {BASE + 1} L{cx + tw / 2} {top}" fill="none" '
        f'stroke="{LIT_WARM}" strokeOpacity="0.45" strokeWidth="0.8" />')
    # sun glinting off the glass
    for y in range(top + 10, BASE, 9):
        frac = (y - top) / (BASE - top)
        half = tw / 2 + (bw - tw) / 2 * frac
        if rnd.random() < 0.55:
            ww = rnd.choice([3, 5, 8])
            r(cx - half + 2 + rnd.random() * (half - ww), y, ww, 1.3, LIT, f' opacity="{rnd.uniform(0.35, 0.8):.2f}"')
    r(cx - tw / 2 - 1, top - 6, tw + 2, 6, MID)
    r(cx - tw / 2 - 1, top - 6, tw + 2, 1, LIT_WARM, ' opacity="0.6"')
    r(cx - 1, 30, 2, top - 36, MID)
    add(f'<circle cx="{cx}" cy="30" r="1.8" fill="{BEACON}" />')


pencil(232, 16, 122)
empire(170)
chrysler(300)
supertall(455, 20, 84)
tapered(545)

# ---------------------------------------------------------------- near city, with rooftop water towers
x = X0 - 4
while x < X1:
    w, h = rnd.randint(22, 46), rnd.randint(16, 58)
    r(x, BASE - h, w + 1, h + 1, NEAR)
    if rnd.random() < 0.1 and w > 30:
        tx, ty = x + rnd.uniform(4, w - 13), BASE - h
        add(f'<path d="M{tx:.1f} {ty - 10} h9 v7 h-9 z M{tx - 0.6:.1f} {ty - 10} l5.1 -4.5 l5.1 4.5 z '
            f'M{tx + 1:.1f} {ty - 3} v3 h1 v-3 z M{tx + 7:.1f} {ty - 3} v3 h1 v-3 z" fill="{NEAR}" />')
    windows(x, BASE - h, w, h, max(1, w // 6), max(1, h // 8), lit=0.3, warm=0.6)
    x += w

# ---------------------------------------------------------------- water
r(X0, BASE, X1 - X0, H - BASE, "url(#nyc-water)")
for i in range(16):
    w = 170 - i * 10
    r(SX - w / 2 + rnd.randint(-14, 14), BASE + 5 + i * 3.4, w, 1.4, LIT, f' opacity="{0.75 - i * 0.04:.2f}"')
for _ in range(90):  # pixel sparkle on the water
    r(rnd.uniform(X0, X1), rnd.uniform(BASE + 4, H - 4), PX - 1, 1.5, LIT, f' opacity="{rnd.uniform(0.15, 0.5):.2f}"')

# ---------------------------------------------------------------- grain over everything
add(f'<rect x="{X0}" y="0" width="{X1 - X0}" height="{H}" filter="url(#nyc-grain)" opacity="0.32" style={{{{ mixBlendMode: "overlay" }}}} />')

inner = DEFS + "\n    " + "\n    ".join(out)

jsx = f'''/**
 * NYC campus banner artwork: golden hour over an original, stylized NYC
 * skyline, with the Claude spark setting behind it.
 *
 * Flat shapes plus one SVG noise filter for the grain, so it ships in the
 * prerendered HTML with no image request. The scene is drawn wider than the
 * band (x from {X0} to {X1}) and cropped with `slice`, so it fills any width.
 * Decorative: hidden from assistive tech, the heading carries the meaning.
 *
 * Generated by scripts/nyc-skyline.py; edit that and rerun it rather than
 * hand-editing coordinates here.
 */
const NycSkyline = ({{ className }}) => (
  <svg
    className={{className}}
    viewBox="{X0} 0 {X1 - X0} {H}"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    {inner}
  </svg>
);

export default NycSkyline;
'''
open(f"{REPO}/src/components/NycSkyline.jsx", "w").write(jsx)

if len(sys.argv) > 1:
    svg = re.sub(r"([a-z])([A-Z])", lambda m: m.group(1) + "-" + m.group(2).lower(), inner)
    svg = svg.replace('style={{ mix-blend-mode: "overlay" }}', 'style="mix-blend-mode:overlay"')
    open(sys.argv[1], "w").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} 0 {X1 - X0} {H}" width="{(X1 - X0) * 2}" height="{H * 2}">{svg}</svg>'
    )
print(f"wrote {len(jsx)} bytes")
