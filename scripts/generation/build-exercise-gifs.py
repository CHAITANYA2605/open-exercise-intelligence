#!/usr/bin/env python3
"""Generate a looping demo GIF per exercise from the same pose system as the static illustrations.

Each exercise moves from its start pose to an end pose (one repetition) and back.
Muscle highlights come from muscles.primary and muscles.secondary.
Output: portal/public/data/gifs/<slug>.gif

Usage: python3 scripts/generation/build-exercise-gifs.py
"""
import importlib.util
import json
import math
from copy import deepcopy
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / 'data' / 'generated' / 'oei-dataset-all.json'
OUT = ROOT / 'portal' / 'public' / 'data' / 'gifs'
SIZE = 220
SCALE = 2
FRAMES = 14
DURATION_MS = 80

_spec = importlib.util.spec_from_file_location('build_illustrations', ROOT / 'scripts' / 'generation' / 'build-illustrations.py')
bi = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bi)

BG = (255, 255, 255)
BODY = (71, 85, 105)
PRIMARY = (99, 102, 241)
SECONDARY = (165, 180, 252)
EQUIP = (100, 116, 139)
GROUND = (203, 213, 225)

END_OFFSETS = {
    'lying': {'W': (84, 104), 'E': (80, 118)},
    'incline': {'W': (96, 100), 'E': (92, 108)},
    'press': {'W': (112, 96), 'E': (116, 106)},
    'stand': {'W': (110, 100), 'E': (116, 110)},
    'bent': {'W': (146, 132), 'E': (126, 116)},
    'squat': {'H': (100, 150), 'K': (140, 160), 'S': (110, 104), 'N': (110, 96), 'head': (120, 78)},
    'lunge': {'H': (100, 132), 'K': (132, 160), 'N': (100, 84), 'head': (100, 66), 'S': (100, 94)},
    'hang': {'N': (100, 70), 'S': (100, 80), 'head': (100, 50), 'E': (118, 76)},
    'seated': {'W': (128, 118), 'E': (118, 112)},
    'kneel': {'W': (128, 120), 'E': (118, 112)},
    'twist': {'W': (150, 110), 'E': (124, 104)},
    'bridge': {'H': (126, 128), 'N': (72, 160), 'S': (72, 158)},
    'supine': {'N': (80, 164), 'S': (84, 160), 'head': (56, 160), 'E': (96, 150)},
    'plank': {'N': (66, 116), 'S': (72, 120), 'head': (46, 108), 'H': (126, 140), 'E': (80, 168)},
    'pushup': {'N': (66, 124), 'S': (72, 128), 'head': (46, 116), 'H': (126, 140), 'E': (84, 158)},
}


def end_pose(key, pose):
    joints = deepcopy({k: v for k, v in pose.items() if isinstance(v, tuple)})
    for name, point in END_OFFSETS.get(key, {}).items():
        if name in joints:
            joints[name] = point
    return joints


def lerp_pose(a, b, t):
    return {k: (a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t) for k in a}


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)


def pt(p, s):
    return (p[0] * s + 10 * s, p[1] * s)


def draw_seg(d, a, b, w, color, s):
    a, b = pt(a, s), pt(b, s)
    ww = max(1, int(w * s))
    d.line([a, b], fill=color, width=ww)
    r = ww / 2
    for c in (a, b):
        d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=color)


def draw_dot(d, c, r, color, s):
    x, y = pt(c, s)
    rr = r * s
    d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=color)


def draw_rect(d, x, y, w, h, color, s):
    d.rounded_rectangle([pt((x, y), s)[0], pt((x, y), s)[1], pt((x + w, y + h), s)[0], pt((x + w, y + h), s)[1]], radius=2 * s, fill=color)


def draw_furniture(d, pose, s):
    if pose.get('bench'):
        draw_seg(d, (40, 158), (160, 158), 6, EQUIP, s)
        draw_seg(d, (52, 160), (52, 190), 5, EQUIP, s)
        draw_seg(d, (148, 160), (148, 190), 5, EQUIP, s)
    if pose.get('seat'):
        draw_seg(d, (80, 156), (118, 156), 6, EQUIP, s)
        draw_seg(d, (98, 160), (98, 190), 5, EQUIP, s)
        draw_seg(d, (82, 152), (82, 96), 5, EQUIP, s)
    if pose.get('bar'):
        draw_seg(d, (50, 40), (150, 40), 4, EQUIP, s)


def draw_equipment(d, text, pose, J, s):
    if 'barbell' in text or 'ez bar' in text or 'ez-bar' in text:
        if pose.get('load') == 'S':
            x, y = J['S'][0], J['S'][1] - 6
        elif pose.get('load') is None:
            x, y = J['H'][0], J['H'][1] - 6
        else:
            x, y = J['W']
        draw_seg(d, (x - 58, y), (x + 58, y), 3, EQUIP, s)
        draw_rect(d, x - 64, y - 9, 6, 18, EQUIP, s)
        draw_rect(d, x + 58, y - 9, 6, 18, EQUIP, s)
    if 'dumbbell' in text:
        w = J['W']
        draw_rect(d, w[0] - 9, w[1] - 3.5, 18, 7, EQUIP, s)
    if 'kettlebell' in text:
        draw_dot(d, J['W'], 7, EQUIP, s)
    if bi.re.search(r'\bband', text):
        w = J['W']
        draw_seg(d, w, (w[0], 10), 2, EQUIP, s)
    if bi.re.search(r'\bcable', text):
        w = J['W']
        anchor = (w[0], 10) if w[1] < 110 else (w[0] + 40, 186)
        draw_seg(d, w, anchor, 2, EQUIP, s)


def render_frame(pose, J, roles, text, s):
    img = Image.new('RGB', (SIZE * s, SIZE * s), BG)
    d = ImageDraw.Draw(img)
    draw_seg(d, (8, bi.GROUND_Y), (212, bi.GROUND_Y), 1, GROUND, s)
    draw_furniture(d, pose, s)
    if 'K2' in J:
        draw_seg(d, J['H'], J['K2'], 12, BODY, s)
        draw_seg(d, J['K2'], J['A2'], 10, BODY, s)
    draw_seg(d, J['H'], J['K'], 13, BODY, s)
    draw_seg(d, J['K'], J['A'], 11, BODY, s)
    draw_seg(d, J['N'], J['H'], 26, BODY, s)
    draw_seg(d, J['S'], J['E'], 9, BODY, s)
    draw_seg(d, J['E'], J['W'], 8, BODY, s)
    draw_dot(d, J['head'], 13, BODY, s)
    for region in bi.REGION_ORDER:
        if region not in roles:
            continue
        color = PRIMARY if roles[region] == 'primary' else SECONDARY
        for shape in bi.region_shapes(region, J):
            if shape[0] == 'seg':
                draw_seg(d, shape[1], shape[2], shape[3], color, s)
            else:
                draw_dot(d, shape[1], shape[2], color, s)
    draw_equipment(d, text, pose, J, s)
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def build(ex):
    name = ex.get('name', '')
    start_text = (ex.get('execution') or {}).get('starting_position', '')
    text = ' '.join([name, ex.get('description', ''), start_text]).lower()
    key = bi.choose_pose(name, text, ex.get('movement_pattern', ''))
    pose = bi.POSES[key]
    start = {k: v for k, v in pose.items() if isinstance(v, tuple)}
    end = end_pose(key, pose)
    roles = bi.muscle_roles(ex)
    frames = []
    for i in range(FRAMES):
        t = i / (FRAMES - 1)
        J = lerp_pose(start, end, ease(t))
        frames.append(render_frame(pose, J, roles, text, SCALE))
    loop = frames + frames[-2:0:-1]
    return loop


def main():
    exercises = json.loads(DATASET.read_text(encoding='utf-8'))['exercises']
    OUT.mkdir(parents=True, exist_ok=True)
    for ex in exercises:
        slug = ''.join(c for c in ex['slug'].lower() if c.isalnum() or c == '-')
        frames = build(ex)
        palette_frames = [f.convert('P', palette=Image.ADAPTIVE, colors=64) for f in frames]
        palette_frames[0].save(OUT / f'{slug}.gif', save_all=True, append_images=palette_frames[1:],
                               duration=DURATION_MS, loop=0, optimize=True)
    print(f'Wrote {len(exercises)} GIFs to {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
