"""
Generate the four track ASCII banners.

    pip install numpy pillow
    cd tools && python ascii_scenes.py

Writes ../src/ascii/<track>.html and ../src/ascii/<track>.txt.

HOW IT WORKS. Each scene is drawn as a greyscale picture with Pillow, then
downsampled to a character grid: brightness picks a glyph from RAMP and a
colour from PAL.

ABSTRACT, AND WHY IT WORKS BETTER HERE. These were literal scenes — a
magnifier over a newspaper, a camera, a hammer, a microchip — and they did not
survive the pipeline. A banner is 160 x 18, so one character covers about
10 x 17 source pixels and the grid is barely a sixth as tall as it is wide;
there is no room to draw an object and still have it read as that object.
What does read at this shape is pattern: bars, scanlines, fractures, traces.
Each track now gets one abstract system rather than a picture of a thing, and
the system is chosen to mean what the track means.

BANNER. 160 x 18 is about 5.2:1. The previous grid was 130 x 33 at 2.3:1,
which still ate a third of the panel's height.
"""

import math
import html
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# The default grid: a track banner, 160 x 18, about 5.2:1.
COLS, ROWS = 160, 18

# Per-scene overrides. The masthead runs edge to edge across the page rather
# than inside a panel, so it is wider and far thinner — 240 x 7 is about 20:1.
# At seven rows nothing survives as a picture, so it is drawn as a signal
# strip: flattened rings that read as converging scan lines, not as an object.
GRIDS = {"masthead": (240, 7)}

# Source resolution for the default grid. Only the ASPECT matters: ascii_art()
# resamples to whatever character grid it is given, so a scene can be drawn at
# whatever size is comfortable to think in.
IW, IH = 1600, 309


def vgrad(a, b):
    """A vertical ramp from a at the top to b at the bottom."""
    return np.linspace(a, b, IH)[:, None] * np.ones((1, IW))


# ---------------------------------------------------------------------------
# The four systems.
#
# All four are built the same way: a near-black ground with bright marks on it.
# A mid-grey field resolves to an even wash of # and % and reads as noise, so
# nothing here is allowed to sit in the middle of the range for long.
# ---------------------------------------------------------------------------


# 01 Ministry of Truth — redaction.
# Bars of text reduced to bars, most of them struck out, one column of them
# still lit. Provenance as a pattern: what is left when the words are gone.
def redaction():
    im = Image.fromarray(vgrad(12, 5).astype("uint8"))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(3)

    bar_h = 26
    y = 22
    row = 0
    while y < IH - 20:
        x = 40
        while x < IW - 60:
            w = int(rng.integers(90, 320))
            if x + w > IW - 60:
                w = IW - 60 - x
            # Roughly a third of the bars survive as bright text; the rest are
            # struck through to a dim slab.
            lit = rng.random() < 0.34
            d.rectangle([x, y, x + w, y + bar_h], fill=225 if lit else 46)
            if not lit:
                d.line([(x, y + bar_h / 2), (x + w, y + bar_h / 2)], fill=96, width=6)
            x += w + int(rng.integers(26, 64))
        y += bar_h + 18
        row += 1

    # One vertical shaft of light: the column that was not redacted.
    a = np.array(im, dtype=float)
    yy, xx = np.mgrid[0:IH, 0:IW]
    shaft = np.abs(xx - 1180) < 76
    a = np.where(shaft, np.minimum(255, a * 1.15 + 92), a)
    a = np.where(np.abs(xx - 1180) < 84, a, a)
    return Image.fromarray(a.clip(0, 255).astype("uint8"))


# 02 Telescreen — scanlines.
# A signal being watched. Horizontal lines bent by a standing wave, with one
# bright sweep crossing them, and a band of tearing where it passes.
def scanlines():
    im = Image.fromarray(vgrad(8, 4).astype("uint8"))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(5)

    for i in range(11):
        base = 16 + i * 26
        pts = []
        for x in range(0, IW + 12, 12):
            # Two waves at different rates, so the field never repeats across
            # the banner's width.
            wob = 13 * math.sin(x / 190 + i * 0.7) + 6 * math.sin(x / 61 + i * 1.9)
            pts.append((x, base + wob))
        bright = 90 + int(120 * (0.5 + 0.5 * math.sin(i * 1.1)))
        d.line(pts, fill=bright, width=9)

    a = np.array(im, dtype=float)
    yy, xx = np.mgrid[0:IH, 0:IW]

    # The sweep: a bright horizontal band with a soft falloff.
    sweep = np.exp(-(((yy - 176) / 34.0) ** 2)) * 150
    a = a + sweep

    # Tearing, where the sweep crosses: whole rows displaced sideways.
    out = a.copy()
    for y in range(150, 205, 7):
        shift = int(rng.integers(-70, 70))
        out[y:y + 7] = np.roll(a[y:y + 7], shift, axis=1)

    # Dropout: a few dead rows, because a clean signal is not being watched.
    for y in (58, 96, 250):
        out[y:y + 4] *= 0.15

    return Image.fromarray(out.clip(0, 255).astype("uint8"))


# 03 Sledgehammer — fracture.
# One impact, off to the left, and everything that radiates from it. Bright
# lines on black: the cracks are where the light gets through.
def fracture():
    im = Image.fromarray(vgrad(10, 4).astype("uint8"))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(9)

    ox, oy = 215, 152

    # Energy decays slowly (0.84) over eight generations rather than quickly
    # over six. The first version ran out of reach a third of the way across
    # and left two thirds of a 5:1 banner empty.
    def branch(x, y, ang, energy, depth):
        if energy < 22 or depth > 8:
            return
        length = energy * rng.uniform(1.0, 1.7)
        nx = x + math.cos(ang) * length
        # Vertical travel is damped: the fracture has to spread along a banner
        # eighteen rows tall, so it runs sideways or it runs off the edge.
        ny = y + math.sin(ang) * length * 0.42
        d.line([(x, y), (nx, ny)], fill=int(min(255, 60 + energy * 1.5)),
               width=max(3, int(energy / 22)))
        branch(nx, ny, ang + rng.uniform(-0.30, 0.30), energy * 0.84, depth + 1)
        if rng.random() < 0.42:
            branch(nx, ny, ang + rng.uniform(-0.9, 0.9), energy * 0.55, depth + 1)

    # Weighted toward horizontal, so the fracture spreads along the banner
    # instead of running off the top and bottom edges within two segments.
    # Twelve spokes, nearly all of them aimed right: the impact is at the left
    # end and the banner is what it travels across.
    for k in range(12):
        ang = rng.uniform(-0.62, 0.62)
        if k % 5 == 0:
            ang = math.pi - ang * 0.5
        branch(ox, oy, ang, rng.uniform(140, 200), 0)

    d.ellipse([ox - 34, oy - 20, ox + 34, oy + 20], fill=255)

    a = np.array(im, dtype=float)
    yy, xx = np.mgrid[0:IH, 0:IW]
    dist = np.hypot((xx - ox) / 1.9, yy - oy)
    a = np.where(dist < 150, a + (150 - dist) * 0.55, a)
    return Image.fromarray(a.clip(0, 255).astype("uint8"))


# 04 Room 101 — traces.
# Orthogonal routing with vias, the way a board looks before anything is
# soldered to it. Right angles only: this is the one track that is about
# physical things, and a board is the most abstract picture of one.
def traces():
    im = Image.fromarray(vgrad(9, 4).astype("uint8"))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(13)

    lanes = [34, 74, 114, 154, 194, 234, 274]

    for i, y in enumerate(lanes):
        x = int(rng.integers(-60, 40))
        cur = y
        pts = [(x, cur)]
        while x < IW + 60:
            run = int(rng.integers(90, 260))
            x += run
            pts.append((x, cur))
            if rng.random() < 0.55:
                # A 90 degree jog to a neighbouring lane, then onward.
                step = int(rng.choice([-40, 40]))
                if 20 < cur + step < IH - 20:
                    cur += step
                    pts.append((x, cur))
        bright = 110 + i * 16
        d.line(pts, fill=bright, width=7)

        for px, py in pts[1:-1:3]:
            d.ellipse([px - 13, py - 13, px + 13, py + 13], fill=245)
            d.ellipse([px - 5, py - 5, px + 5, py + 5], fill=0)

    # Pads along the bottom edge, where the board would meet a connector.
    for x in range(90, IW - 60, 74):
        d.rectangle([x, IH - 26, x + 34, IH - 6], fill=205)

    return im


# 05 Masthead — aperture.
# Sits above the sponsor tiers, where a drawn logo used to. Concentric rings
# cut by horizontal scan streaks: an iris, or a lens, or a signal being
# resolved, depending on how long you look at it. Abstract for the same reason
# the track banners are — at eighteen rows a drawn mark has nowhere to go.
def masthead():
    # Its own canvas: (240 * 0.6) / (7 * 1.03) = 19.97:1. Drawing it on the
    # default 5.2:1 sheet and resampling would squash the rings to a quarter
    # of the flatness intended.
    w, h = 1600, 80
    im = Image.fromarray(
        (np.linspace(8, 4, h)[:, None] * np.ones((1, w))).astype("uint8")
    )
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(21)

    cx, cy = w / 2, h / 2

    # Rings, brightest at the middle and flattened hard so they fill a banner
    # rather than running off the top and bottom within three of them.
    # Flattened almost to lines: at seven character rows an ellipse with any
    # real height resolves to two disconnected arcs.
    for i in range(18):
        rx = 34 + i * 46
        ry = rx * 0.052
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry],
                  outline=int(max(16, 250 - i * 14)), width=max(2, 5 - i // 4))

    d.ellipse([cx - 22, cy - 3, cx + 22, cy + 3], fill=255)

    # Scan streaks across the rings, so the shape reads as something being
    # watched rather than as a target.
    for _ in range(22):
        y = int(rng.integers(0, h))
        x0 = int(rng.integers(0, w - 220))
        run = int(rng.integers(140, 600))
        d.line([(x0, y), (x0 + run, y)],
               fill=int(rng.integers(40, 150)), width=int(rng.integers(2, 4)))

    return im


SCENES = {
    "ministry-of-truth": redaction,
    "telescreen": scanlines,
    "sledgehammer": fracture,
    "room-101": traces,
    "masthead": masthead,
}

if __name__ == "__main__":
    import os

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "ascii")
    for i, (name, fn) in enumerate(SCENES.items()):
        grid = GRIDS.get(name)
        h, t = ascii_art(fn(), i, grid)
        with open(os.path.join(out, f"{name}.txt"), "w", encoding="utf-8") as f:
            f.write(t + "\n")
        with open(os.path.join(out, f"{name}.html"), "w", encoding="utf-8") as f:
            f.write(h + "\n")
        c, r = grid or (COLS, ROWS)
        print(f"wrote {name} ({c}x{r})")
