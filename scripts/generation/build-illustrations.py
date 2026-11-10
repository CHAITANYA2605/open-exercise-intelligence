#!/usr/bin/env python3
"""Generate a schematic side-view SVG per exercise.

Pose is chosen from the exercise name, description and starting position
(falling back to movement_pattern). Muscles from muscles.primary and
muscles.secondary are highlighted on the body. Output goes to
portal/public/data/illustrations/<slug>.svg.

Usage: python3 scripts/generation/build-illustrations.py
"""
import json
import math
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / 'data' / 'generated' / 'oei-dataset-all.json'
OUT = ROOT / 'portal' / 'public' / 'data' / 'illustrations'

BODY = '#475569'
PRIMARY = '#6366f1'
SECONDARY = '#a5b4fc'
EQUIP = '#cbd5e1'
GROUND = '#64748b'
TEXT = '#94a3b8'
GROUND_Y = 190

POSES = {
    'stand': dict(head=(100, 52), N=(100, 70), S=(100, 80), H=(100, 122), E=(106, 116), W=(108, 146), K=(104, 160), A=(100, 188), load='W'),
    'press': dict(head=(100, 52), N=(100, 70), S=(100, 80), H=(100, 122), E=(122, 58), W=(130, 30), K=(104, 160), A=(100, 188), load='W'),
    'bent': dict(head=(152, 76), N=(138, 88), S=(132, 96), H=(100, 124), E=(136, 124), W=(138, 150), K=(108, 160), A=(100, 188), load='W'),
    'squat': dict(head=(116, 64), N=(108, 80), S=(108, 92), H=(100, 132), E=(134, 100), W=(152, 96), K=(132, 158), A=(102, 188), load='S'),
    'lunge': dict(head=(100, 52), N=(100, 70), S=(100, 80), H=(100, 120), E=(108, 112), W=(110, 140), K=(130, 150), A=(128, 188), K2=(74, 164), A2=(44, 186), load='S'),
    'lying': dict(head=(46, 132), N=(66, 138), S=(74, 136), H=(124, 138), E=(76, 108), W=(82, 78), K=(168, 122), A=(176, 188), bench=True, load='W'),
    'incline': dict(head=(72, 98), N=(82, 112), S=(90, 116), H=(126, 150), E=(94, 88), W=(100, 58), K=(170, 130), A=(180, 188), bench=True, load='W'),
    'seated': dict(head=(98, 70), N=(96, 88), S=(98, 98), H=(96, 146), E=(120, 112), W=(124, 140), K=(150, 146), A=(154, 188), seat=True, load='W'),
    'kneel': dict(head=(106, 54), N=(106, 72), S=(106, 82), H=(96, 124), E=(122, 108), W=(130, 134), K=(116, 184), A=(152, 188), load='W'),
    'plank': dict(head=(46, 100), N=(66, 108), S=(72, 112), H=(126, 132), E=(80, 160), W=(62, 182), K=(162, 156), A=(190, 184), load=None),
    'pushup': dict(head=(46, 100), N=(66, 108), S=(72, 112), H=(126, 132), E=(84, 146), W=(68, 182), K=(162, 156), A=(190, 184), load=None),
    'bridge': dict(head=(50, 176), N=(72, 172), S=(72, 170), H=(126, 146), E=(100, 184), W=(124, 186), K=(160, 160), A=(170, 188), load=None),
    'supine': dict(head=(46, 176), N=(66, 176), S=(74, 172), H=(130, 178), E=(90, 160), W=(108, 150), K=(164, 150), A=(186, 188), load=None),
    'hang': dict(head=(100, 70), N=(100, 86), S=(100, 96), H=(100, 130), E=(126, 92), W=(106, 44), K=(104, 164), A=(100, 190), bar=True, load=None),
    'twist': dict(head=(100, 52), N=(100, 70), S=(100, 80), H=(100, 122), E=(128, 94), W=(156, 96), K=(104, 160), A=(100, 188), load='W'),
}

POSE_RULES = [
    (r'bridge|hip thrust', 'bridge'),
    (r'pull[- ]?up|chin[- ]?up|pull[- ]?down|pulldown|lat pull|\bhang', 'hang'),
    (r'push[- ]?up|press[- ]?up', 'pushup'),
    (r'\bplank', 'plank'),
    (r'incline', 'incline'),
    (r'crunch|sit[- ]?up|leg raise|hollow|dead bug|\bsupine', 'supine'),
    (r'leg curl|hamstring curl|back extension|hyperextension', 'lying'),
    (r'bench press|chest press|\bfly|flye|pullover|skull|crusher|lying|\bbench\b', 'lying'),
    (r'\bkneel', 'kneel'),
    (r'seated|\bsitting|leg press|\bseat\b', 'seated'),
    (r'lunge|split squat|step[- ]?up|bulgarian', 'lunge'),
    (r'squat', 'squat'),
    (r'curl|extension|pushdown|press[- ]?down|pressdown|raise|carry|farmer', 'stand'),
    (r'deadlift|hinge|good morning|romanian|\brow|\bpull\b|swing|kickback', 'bent'),
    (r'twist|rotation|woodchop|chop|pallof|windmill', 'twist'),
    (r'overhead|shoulder press|military press|arnold|\bpress\b', 'press'),
]

MOVEMENT_DEFAULT = {
    'push': 'stand', 'pull': 'bent', 'hinge': 'bent', 'rotation': 'twist',
    'anti-rotation': 'twist', 'squat': 'squat', 'lunge': 'lunge', 'overhead': 'press',
    'carry': 'stand', 'plank': 'plank', 'gait': 'stand', 'bridge': 'bridge',
    'balance': 'stand', 'plyometric': 'stand',
}


def match_pose(text):
    for rx, pose in POSE_RULES:
        if re.search(rx, text):
            return pose
    return None


def choose_pose(name, text, pattern):
    return match_pose(name.lower()) or match_pose(text) or MOVEMENT_DEFAULT.get(pattern, 'stand')


def muscle_regions(slug):
    s = slug.lower()
    if 'rectus-femoris' in s or 'vastus' in s or 'quadriceps' in s or 'sartorius' in s or 'iliacus' in s or 'psoas' in s or 'pectineus' in s:
        return ['thigh_front']
    if 'femoris' in s or 'hamstring' in s or 'semitendinosus' in s or 'semimembranosus' in s or 'gracilis' in s or 'adductor' in s:
        return ['thigh_back']
    if 'gluteus' in s or 'tensor' in s:
        return ['glute']
    if 'tibialis' in s:
        return ['shin_front']
    if 'gastrocnemius' in s or 'soleus' in s:
        return ['calf']
    if 'brachialis' in s or 'biceps' in s:
        return ['upper_arm_front']
    if 'triceps' in s:
        return ['upper_arm_back']
    if 'brachioradialis' in s or 'carpi' in s or 'forearm' in s:
        return ['forearm']
    if 'deltoid' in s or 'rotator' in s or 'supraspinatus' in s or 'infraspinatus' in s or 'teres-minor' in s or 'subscapularis' in s:
        return ['shoulder']
    if 'rectus-abdominis' in s or 'oblique' in s or 'abdominis' in s or 'erector' in s or 'iliocostalis' in s or 'longissimus' in s:
        return ['lower_torso']
    if 'pectoralis' in s or 'latissimus' in s or 'teres-major' in s or 'rhomboid' in s or 'trapezius' in s or 'serratus' in s:
        return ['upper_torso']
    return []


REGION_ORDER = ['thigh_back', 'glute', 'calf', 'shin_front', 'thigh_front', 'upper_arm_back',
                'upper_arm_front', 'forearm', 'upper_torso', 'lower_torso', 'shoulder']


def mid(a, b):
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)


def offset(a, b, d):
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dy) or 1
    nx, ny = dy / length, -dx / length
    return (a[0] + nx * d, a[1] + ny * d), (b[0] + nx * d, b[1] + ny * d)


def region_shapes(region, J):
    if region == 'shoulder':
        return [('dot', J['S'], 10)]
    if region == 'upper_torso':
        return [('seg', J['N'], mid(J['N'], J['H']), 24)]
    if region == 'lower_torso':
        return [('seg', mid(J['N'], J['H']), J['H'], 24)]
    if region == 'glute':
        return [('dot', (J['H'][0] - 6, J['H'][1] + 3), 11)]
    if region == 'upper_arm_front':
        a, b = offset(J['S'], J['E'], 4)
        return [('seg', a, b, 6)]
    if region == 'upper_arm_back':
        a, b = offset(J['S'], J['E'], -4)
        return [('seg', a, b, 6)]
    if region == 'forearm':
        return [('seg', J['E'], J['W'], 8)]
    if region == 'thigh_front':
        a, b = offset(J['H'], J['K'], 4)
        return [('seg', a, b, 8)]
    if region == 'thigh_back':
        a, b = offset(J['H'], J['K'], -4)
        return [('seg', a, b, 8)]
    if region == 'calf':
        a, b = offset(J['K'], mid(J['K'], J['A']), -4)
        return [('seg', a, b, 7)]
    if region == 'shin_front':
        a, b = offset(mid(J['K'], J['A']), J['A'], 4)
        return [('seg', a, b, 6)]
    return []


def seg(a, b, w, color):
    return (f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" '
            f'stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>')


def dot(c, r, color):
    return f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="{r}" fill="{color}"/>'


def rect(x, y, w, h, color, rx=2):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w}" height="{h}" rx="{rx}" fill="{color}"/>'


def draw_shape(shape, color):
    if shape[0] == 'seg':
        return seg(shape[1], shape[2], shape[3], color)
    return dot(shape[1], shape[2], color)


def muscle_roles(ex):
    roles = {}
    muscles = ex.get('muscles', {})
    for m in muscles.get('primary', []):
        for r in muscle_regions(m.get('muscle_slug', '')):
            roles[r] = 'primary'
    for m in muscles.get('secondary', []):
        for r in muscle_regions(m.get('muscle_slug', '')):
            roles.setdefault(r, 'secondary')
    return roles


def equipment_svg(text, pose, J):
    out = []
    if 'barbell' in text or 'ez bar' in text or 'ez-bar' in text:
        if pose.get('load') == 'S':
            x, y = J['S'][0], J['S'][1] - 6
        elif pose.get('load') is None:
            x, y = J['H'][0], J['H'][1] - 6
        else:
            x, y = J['W']
        out.append(seg((x - 58, y), (x + 58, y), 3, EQUIP))
        out.append(rect(x - 64, y - 9, 6, 18, EQUIP))
        out.append(rect(x + 58, y - 9, 6, 18, EQUIP))
    if 'dumbbell' in text:
        w = J['W']
        out.append(rect(w[0] - 9, w[1] - 3.5, 18, 7, EQUIP))
    if 'kettlebell' in text:
        w = J['W']
        out.append(f'<path d="M{w[0]-5:.1f} {w[1]-6:.1f} Q{w[0]:.1f} {w[1]-17:.1f} {w[0]+5:.1f} {w[1]-6:.1f}" fill="none" stroke="{EQUIP}" stroke-width="2"/>')
        out.append(dot(w, 7, EQUIP))
    if re.search(r'\bband', text):
        w = J['W']
        out.append(f'<line x1="{w[0]:.1f}" y1="{w[1]:.1f}" x2="{w[0]:.1f}" y2="10" stroke="{EQUIP}" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round"/>')
    if re.search(r'\bcable', text):
        w = J['W']
        anchor = (w[0], 10) if w[1] < 110 else (w[0] + 40, GROUND_Y - 4)
        out.append(seg(w, anchor, 2, EQUIP))
        out.append(dot(anchor, 3, EQUIP))
    return out


def pose_furniture(pose):
    out = []
    if pose.get('bench'):
        out.append(seg((40, 158), (160, 158), 6, EQUIP))
        out.append(seg((52, 160), (52, GROUND_Y), 5, EQUIP))
        out.append(seg((148, 160), (148, GROUND_Y), 5, EQUIP))
    if pose.get('seat'):
        out.append(seg((80, 156), (118, 156), 6, EQUIP))
        out.append(seg((98, 160), (98, GROUND_Y), 5, EQUIP))
        out.append(seg((82, 152), (82, 96), 5, EQUIP))
    if pose.get('bar'):
        out.append(seg((50, 40), (150, 40), 4, EQUIP))
    return out


def legend(roles):
    if not roles:
        return ''
    parts = [
        dot((20, 212), 4, PRIMARY),
        f'<text x="28" y="215" font-size="10" fill="{TEXT}" font-family="system-ui, sans-serif">Primary</text>',
        dot((96, 212), 4, SECONDARY),
        f'<text x="104" y="215" font-size="10" fill="{TEXT}" font-family="system-ui, sans-serif">Secondary</text>',
    ]
    return ''.join(parts)


def render(ex):
    name = ex.get('name', '')
    start = (ex.get('execution') or {}).get('starting_position', '')
    text = ' '.join([name, ex.get('description', ''), start]).lower()
    pose_key = choose_pose(name, text, ex.get('movement_pattern', ''))
    pose = POSES[pose_key]
    J = {k: v for k, v in pose.items() if isinstance(v, tuple)}
    roles = muscle_roles(ex)

    body = []
    body.append(f'<line x1="8" y1="{GROUND_Y}" x2="212" y2="{GROUND_Y}" stroke="{GROUND}" stroke-opacity="0.5" stroke-width="1"/>')
    body.extend(pose_furniture(pose))
    if 'K2' in J:
        body.append(seg(J['H'], J['K2'], 12, BODY))
        body.append(seg(J['K2'], J['A2'], 10, BODY))
    body.append(seg(J['H'], J['K'], 13, BODY))
    body.append(seg(J['K'], J['A'], 11, BODY))
    body.append(seg(J['N'], J['H'], 26, BODY))
    body.append(seg(J['S'], J['E'], 9, BODY))
    body.append(seg(J['E'], J['W'], 8, BODY))
    body.append(dot(J['head'], 13, BODY))

    for region in REGION_ORDER:
        if region not in roles:
            continue
        color = PRIMARY if roles[region] == 'primary' else SECONDARY
        for shape in region_shapes(region, J):
            body.append(draw_shape(shape, color))

    body.extend(equipment_svg(text, pose, J))
    body.append(legend(roles))

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220" role="img">'
        f'<title>{escape(name)}</title>'
        '<g transform="translate(10,0)">' + ''.join(body) + '</g>'
        '</svg>\n'
    ), pose_key


def main():
    data = json.loads(DATASET.read_text(encoding='utf-8'))
    exercises = data['exercises']
    OUT.mkdir(parents=True, exist_ok=True)
    pose_counts = {}
    unmapped = 0
    for ex in exercises:
        svg, pose_key = render(ex)
        pose_counts[pose_key] = pose_counts.get(pose_key, 0) + 1
        if not muscle_roles(ex):
            unmapped += 1
        slug = re.sub(r'[^a-z0-9-]', '', ex['slug'].lower())
        (OUT / f'{slug}.svg').write_text(svg, encoding='utf-8')
    print(f'Wrote {len(exercises)} illustrations to {OUT.relative_to(ROOT)}')
    print('Poses:', dict(sorted(pose_counts.items(), key=lambda kv: -kv[1])))
    print(f'Exercises with no mapped muscle highlight: {unmapped}')


if __name__ == '__main__':
    main()
