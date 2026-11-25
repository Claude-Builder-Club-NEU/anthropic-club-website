"""Generate src/components/NycSkyline.jsx: an original, stylized NYC skyline.

    python3 scripts/nyc-skyline.py [preview.svg]

Writes the JSX component, and optionally a standalone SVG to eyeball. The
random layers (far/near buildings, lit windows, water) are seeded, so a rerun
with no edits reproduces the same picture.
"""
import os, random, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spark_d = re.findall(r'd="([^"]+)"', open(f"{REPO}/src/assets/brand/claude-spark.svg").read())[0]

W, H = 640, 360
BASE = 302          # street line
rnd = random.Random(1984)

INK_FAR = "#24231f"
INK_MID = "#302f2b"
INK_NEAR = "#1b1a18"
EDGE = "#4a4843"
CREAM = "#f0eee6"
CORAL = "#d97757"
CORAL_SOFT = "#e8a184"

parts = []
add = parts.append

def windows(x, y, w, h, cols, rows, lit=0.22, coral=0.35, pad=3, size=(2.2, 3.2)):
    """Window grid inside a facade. Deterministic, a few lit."""
    out = []
    if cols <= 0 or rows <= 0:
        return out
    cw = (w - 2 * pad) / cols
    rh = (h - 2 * pad) / rows
    for r in range(rows):
        for c in range(cols):
            if rnd.random() > lit:
                continue
            col = CORAL if rnd.random() < coral else CREAM
            op = 0.55 + rnd.random() * 0.4
            wx = x + pad + c * cw + (cw - size[0]) / 2
            wy = y + pad + r * rh + (rh - size[1]) / 2
            out.append(f'<rect x="{wx:.1f}" y="{wy:.1f}" width="{size[0]}" height="{size[1]}" fill="{col}" opacity="{op:.2f}" />')
    return out

# ---------------------------------------------------------------- defs
defs = f'''
<defs>
  <radialGradient id="nyc-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor="{CORAL}" stopOpacity="0.55" />
    <stop offset="0.45" stopColor="{CORAL}" stopOpacity="0.18" />
    <stop offset="1" stopColor="{CORAL}" stopOpacity="0" />
  </radialGradient>
  <linearGradient id="nyc-water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="{CORAL}" stopOpacity="0.16" />
    <stop offset="1" stopColor="{CORAL}" stopOpacity="0" />
  </linearGradient>
  <linearGradient id="nyc-fade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stopColor="#141413" stopOpacity="1" />
    <stop offset="0.24" stopColor="#141413" stopOpacity="0" />
  </linearGradient>
</defs>'''

# ---------------------------------------------------------------- sky
# A few stars
for _ in range(26):
    sx, sy = rnd.uniform(20, W - 10), rnd.uniform(10, 150)
    add(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{rnd.choice([0.7, 0.9, 1.2])}" fill="{CREAM}" opacity="{rnd.uniform(0.25, 0.6):.2f}" />')

# The rising Claude spark, sitting behind the skyline like a sun.
SX, SY, SS = 388, 196, 1.4
add(f'<circle cx="{SX}" cy="{SY}" r="170" fill="url(#nyc-glow)" />')
add(f'<g transform="translate({SX - 47 * SS:.1f} {SY - 47 * SS:.1f}) scale({SS})"><path d="{spark_d}" fill="{CORAL}" /></g>')

# ---------------------------------------------------------------- far layer
x = 0
while x < W:
    w = rnd.randint(16, 34)
    h = rnd.randint(40, 120)
    add(f'<rect x="{x}" y="{BASE - h}" width="{w + 1}" height="{h + 2}" fill="{INK_FAR}" />')
    if rnd.random() < 0.4:  # rooftop water tower or small setback
        add(f'<rect x="{x + w / 2 - 3:.1f}" y="{BASE - h - 6}" width="6" height="6" fill="{INK_FAR}" />')
    parts.extend(windows(x, BASE - h, w, h, max(1, w // 7), h // 9, lit=0.12, coral=0.3))
    x += w

# ---------------------------------------------------------------- landmarks
def empire(cx):
    tiers = [(64, 190), (50, 150), (36, 128), (24, 112), (14, 100)]
    for w, top in tiers:
        add(f'<rect x="{cx - w / 2}" y="{top}" width="{w}" height="{BASE - top + 1}" fill="{INK_MID}" />')
    # Mast and antenna
    add(f'<path d="M{cx - 5} 100 L{cx - 3} 76 L{cx + 3} 76 L{cx + 5} 100 Z" fill="{INK_MID}" />')
    add(f'<rect x="{cx - 1}" y="38" width="2" height="40" fill="{INK_MID}" />')
    add(f'<circle cx="{cx}" cy="38" r="1.6" fill="{CORAL}" />')
    # Crown light band
    add(f'<rect x="{cx - 7}" y="104" width="14" height="3" fill="{CORAL}" opacity="0.85" />')
    add(f'<rect x="{cx - 12}" y="116" width="24" height="2" fill="{CORAL_SOFT}" opacity="0.6" />')
    # Vertical piers
    for dx in (-20, -10, 0, 10, 20):
        add(f'<rect x="{cx + dx - 0.5}" y="152" width="1" height="{BASE - 152}" fill="{EDGE}" opacity="0.55" />')
    parts.extend(windows(cx - 32, 190, 64, BASE - 190, 8, 12, lit=0.3))
    parts.extend(windows(cx - 25, 152, 50, 36, 6, 4, lit=0.3))


def chrysler(cx):
    w = 34
    add(f'<rect x="{cx - w / 2}" y="150" width="{w}" height="{BASE - 150 + 1}" fill="{INK_MID}" />')
    add(f'<rect x="{cx - w / 2 - 8}" y="214" width="{w + 16}" height="{BASE - 214 + 1}" fill="{INK_MID}" />')
    # Stacked sunburst arches: the signature crown, drawn as nested domes.
    domes = [(17, 150), (13, 132), (9.5, 117), (6.5, 104)]
    for r, base in domes:
        add(f'<path d="M{cx - r} {base} A{r} {r * 1.15} 0 0 1 {cx + r} {base} Z" fill="{INK_MID}" stroke="{CREAM}" strokeOpacity="0.55" strokeWidth="1" />')
        # Triangular windows along each arch
        n = 5
        for i in range(n):
            t = (i + 0.5) / n
            import math
            ang = math.pi * (1 - t)
            px = cx + (r - 3) * math.cos(ang)
            py = base - (r - 3) * 1.15 * math.sin(ang)
            add(f'<path d="M{px - 1.3:.1f} {py + 1.4:.1f} L{px:.1f} {py - 1.6:.1f} L{px + 1.3:.1f} {py + 1.4:.1f} Z" fill="{CORAL}" opacity="0.95" />')
    # Spire
    add(f'<path d="M{cx - 3.5} 98 L{cx} 44 L{cx + 3.5} 98 Z" fill="{INK_MID}" stroke="{CREAM}" strokeOpacity="0.55" strokeWidth="0.8" />')
    parts.extend(windows(cx - w / 2, 152, w, BASE - 152, 4, 14, lit=0.28))


def one_wtc(cx):
    # Tapered, faceted prism.
    bw, tw, top = 56, 26, 96
    add(f'<path d="M{cx - bw / 2} {BASE + 1} L{cx - tw / 2} {top} L{cx + tw / 2} {top} L{cx + bw / 2} {BASE + 1} Z" fill="{INK_MID}" />')
    add(f'<path d="M{cx - bw / 2} {BASE + 1} L{cx - tw / 2} {top} L{cx} {BASE + 1} Z" fill="#3a3834" />')
    add(f'<path d="M{cx + bw / 2} {BASE + 1} L{cx + tw / 2} {top} L{cx} {BASE + 1} Z" fill="#2a2926" />')
    add(f'<path d="M{cx - tw / 2} {top} L{cx} {BASE + 1} L{cx + tw / 2} {top}" fill="none" stroke="{CREAM}" strokeOpacity="0.25" strokeWidth="0.8" />')
    add(f'<rect x="{cx - tw / 2}" y="{top - 6}" width="{tw}" height="6" fill="{INK_MID}" />')
    add(f'<rect x="{cx - 1}" y="34" width="2" height="{top - 40}" fill="{INK_MID}" />')
    add(f'<circle cx="{cx}" cy="34" r="1.6" fill="{CORAL}" />')
    # Horizontal glints
    for i, y in enumerate(range(top + 14, BASE, 13)):
        frac = (y - top) / (BASE - top)
        half = tw / 2 + (bw - tw) / 2 * frac
        if rnd.random() < 0.45:
            col = CORAL if rnd.random() < 0.4 else CREAM
            x0 = cx - half + 4 + rnd.random() * (half - 6)
            add(f'<rect x="{x0:.1f}" y="{y}" width="{rnd.choice([3, 4, 6]):d}" height="1.6" fill="{col}" opacity="0.6" />')


def slender(cx, w, top):
    add(f'<rect x="{cx - w / 2}" y="{top}" width="{w}" height="{BASE - top + 1}" fill="{INK_MID}" />')
    for y in range(top + 8, BASE, 14):
        add(f'<rect x="{cx - w / 2}" y="{y}" width="{w}" height="1" fill="{EDGE}" opacity="0.6" />')
    parts.extend(windows(cx - w / 2, top, w, BASE - top, 3, (BASE - top) // 7, lit=0.25))


slender(232, 16, 120)       # pencil tower
empire(170)
chrysler(300)
slender(455, 20, 84)        # very tall, very thin
one_wtc(545)

# ---------------------------------------------------------------- near layer
x = -4
while x < W:
    w = rnd.randint(22, 44)
    h = rnd.randint(18, 58)
    add(f'<rect x="{x}" y="{BASE - h}" width="{w + 1}" height="{h + 1}" fill="{INK_NEAR}" />')
    if rnd.random() < 0.35:
        # Classic rooftop water tower
        tx = x + rnd.uniform(4, w - 12)
        ty = BASE - h
        add(f'<path d="M{tx:.1f} {ty - 9} L{tx + 9:.1f} {ty - 9} L{tx + 9:.1f} {ty - 2} L{tx:.1f} {ty - 2} Z M{tx - 0.5:.1f} {ty - 9} L{tx + 4.5:.1f} {ty - 13} L{tx + 9.5:.1f} {ty - 9} Z" fill="{INK_NEAR}" />')
        add(f'<path d="M{tx + 1:.1f} {ty - 2} L{tx + 1:.1f} {ty} M{tx + 8:.1f} {ty - 2} L{tx + 8:.1f} {ty}" stroke="{INK_NEAR}" strokeWidth="1" />')
    parts.extend(windows(x, BASE - h, w, h, max(1, w // 6), max(1, h // 8), lit=0.3, coral=0.45))
    x += w

# ---------------------------------------------------------------- bridge
DECK = 318
add(f'<rect x="0" y="{BASE}" width="{W}" height="{H - BASE}" fill="#141413" />')
add(f'<rect x="0" y="{BASE}" width="{W}" height="{H - BASE}" fill="url(#nyc-water)" />')

def tower(cx):
    tw, top = 26, 236
    d = (f'M{cx - tw / 2} {H} L{cx - tw / 2} {top} L{cx + tw / 2} {top} L{cx + tw / 2} {H} Z ')
    # two gothic arches cut out
    for ax in (cx - 6, cx + 6):
        d += (f'M{ax - 3.6} {DECK + 2} L{ax - 3.6} {top + 22} Q{ax} {top + 12} {ax + 3.6} {top + 22} L{ax + 3.6} {DECK + 2} Z ')
    add(f'<path d="{d}" fill="{INK_NEAR}" fillRule="evenodd" stroke="{EDGE}" strokeWidth="0.8" />')
    add(f'<rect x="{cx - tw / 2 - 2}" y="{top - 3}" width="{tw + 4}" height="4" fill="{INK_NEAR}" stroke="{EDGE}" strokeWidth="0.8" />')
    return cx, top

t1 = tower(150)
t2 = tower(430)
# main cables and suspenders
cab = []
def cable(x0, y0, x1, y1, sag):
    mx = (x0 + x1) / 2
    cy = (y0 + y1) / 2 + sag
    cab.append(f'<path d="M{x0} {y0} Q{mx} {cy} {x1} {y1}" fill="none" stroke="{CORAL}" strokeWidth="1.3" strokeOpacity="0.9" />')
    # suspenders
    steps = int(abs(x1 - x0) / 9)
    for i in range(1, steps):
        t = i / steps
        qx = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1
        qy = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1
        if qy < DECK - 1:
            cab.append(f'<line x1="{qx:.1f}" y1="{qy:.1f}" x2="{qx:.1f}" y2="{DECK}" stroke="{CORAL}" strokeWidth="0.5" strokeOpacity="0.45" />')

cable(t1[0], t1[1], t2[0], t2[1], 150)
cable(-60, DECK - 4, t1[0], t1[1], 22)
cable(t2[0], t2[1], W + 60, DECK - 4, 22)
# diagonal stays, the bridge's signature web
for (tx, ty) in (t1, t2):
    for k in range(1, 6):
        for sgn in (-1, 1):
            cab.append(f'<line x1="{tx}" y1="{ty + 4}" x2="{tx + sgn * k * 16}" y2="{DECK}" stroke="{CREAM}" strokeWidth="0.4" strokeOpacity="0.28" />')
parts.extend(cab)
# deck
add(f'<rect x="0" y="{DECK}" width="{W}" height="5" fill="{INK_NEAR}" stroke="{EDGE}" strokeWidth="0.8" />')
for x in range(4, W, 9):
    add(f'<rect x="{x}" y="{DECK + 1.5}" width="4" height="2" fill="{CORAL}" opacity="0.55" />')
# re-draw tower fronts over the deck/cables
tower(150)
tower(430)

# water reflections
for _ in range(60):
    rx = rnd.uniform(0, W)
    ry = rnd.uniform(DECK + 10, H - 4)
    rw = rnd.uniform(6, 30)
    add(f'<rect x="{rx:.1f}" y="{ry:.1f}" width="{rw:.1f}" height="1" fill="{rnd.choice([CORAL, CORAL, CREAM])}" opacity="{rnd.uniform(0.12, 0.4):.2f}" />')

# left edge fade into the panel
add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="url(#nyc-fade)" />')

body = "\n    ".join(parts)
svg_inner = defs + "\n    " + body

jsx = f'''/**
 * NYC skyline at night, with the Claude spark rising behind it.
 *
 * Original artwork for the NYC campus banner, generated as flat shapes (no
 * raster, no webfont), so it ships in the prerendered HTML and costs nothing
 * on the wire beyond its markup. Stylized landmarks, left to right: an Art
 * Deco setback tower, a pencil tower, a sunburst-crowned spire, a very thin
 * supertall and a tapered glass tower, with a suspension bridge in the
 * foreground and the harbour under it.
 *
 * Palette is the banner's own: ink layers, cream and coral lights. Decorative,
 * so it is hidden from assistive tech; the banner's heading carries the meaning.
 *
 * Generated by scripts/nyc-skyline.py; edit that and rerun it rather than
 * hand-editing coordinates here.
 */
const NycSkyline = ({{ className }}) => (
  <svg
    className={{className}}
    viewBox="0 0 {W} {H}"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    {svg_inner}
  </svg>
);

export default NycSkyline;
'''
open(f"{REPO}/src/components/NycSkyline.jsx", "w").write(jsx)

# standalone preview
def to_svg(s):
    s = re.sub(r'([a-z])([A-Z])', lambda m: m.group(1) + '-' + m.group(2).lower(), s)
    return s
prev = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W*2}" height="{H*2}"><rect width="{W}" height="{H}" fill="#141413"/>{to_svg(svg_inner)}</svg>'
if len(sys.argv) > 1:
    open(sys.argv[1], "w").write(prev)
print(len(jsx), "bytes")
