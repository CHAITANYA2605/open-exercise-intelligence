#!/usr/bin/env python3
"""Build a static exercise guide (one page per exercise plus an index) from the OEI dataset.

Output: docs/exercise-guide/index.html and docs/exercise-guide/exercises/<slug>.html
Illustrations are linked from portal/public/data/illustrations/<slug>.svg when present.

Usage: python3 scripts/generation/build-exercise-guide.py
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / 'data' / 'generated' / 'oei-dataset-all.json'
EQUIPMENT = ROOT / 'data' / 'equipment' / 'equipment.json'
ILLUSTRATIONS = ROOT / 'portal' / 'public' / 'data' / 'illustrations'
OUT = ROOT / 'docs' / 'exercise-guide'
PAGES = OUT / 'exercises'

CSS = """
:root{--bg:#0f172a;--panel:#1e293b;--line:#334155;--text:#e2e8f0;--muted:#94a3b8;--accent:#818cf8;--red:#f87171;--amber:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
main{max-width:960px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:2rem;margin:.2em 0 .4em}h2{font-size:1.2rem;margin:0 0 .6em;color:var(--accent)}
.meta{color:var(--muted);font-size:.9rem}.tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 16px}
.tag{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:2px 10px;font-size:.8rem;color:var(--muted)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:14px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:700px){.grid{grid-template-columns:1fr}}
ol,ul{padding-left:1.2em;margin:0}li{margin:.35em 0}
.illus{background:#fff;border-radius:12px;padding:12px;display:flex;justify-content:center}
.illus{gap:16px;flex-wrap:wrap}.illus img{max-width:260px;width:100%;height:auto}
.warn li{color:var(--amber)}.bad li{color:var(--red)}
.search{width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:1rem;margin:12px 0}
.list a{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-bottom:1px solid var(--line);color:var(--text)}
.list a:hover{background:var(--panel);text-decoration:none}.list span{color:var(--muted);font-size:.85rem}
.crumbs{font-size:.9rem;color:var(--muted)}
"""


def pretty(slug):
    return slug.replace('-', ' ')


def load_equipment():
    items = json.loads(EQUIPMENT.read_text(encoding='utf-8'))
    return {e['equipment_id']: e['name'] for e in items}


def as_list(value):
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    return [str(v) for v in value]


def rep_summary(params):
    rows = []
    for item in (params or {}).get('recommended_rep_ranges', []):
        rows.append(f"{item.get('goal', '')}: {item.get('min_reps')}–{item.get('max_reps')} reps")
    for item in (params or {}).get('recommended_set_ranges', []):
        rows.append(f"{item.get('goal', '')}: {item.get('min_sets')}–{item.get('max_sets')} sets")
    return rows


def page(title, body, crumbs):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} · OEI Exercise Guide</title><style>{CSS}</style></head>
<body><main>
<div class="crumbs">{crumbs}</div>
{body}
</main></body></html>
"""


def section(title, items, cls=''):
    if not items:
        return ''
    lis = ''.join(f'<li>{escape(i)}</li>' for i in items)
    return f'<div class="card {cls}"><h2>{escape(title)}</h2><ol class="{cls}">{lis}</ol></div>' if cls.startswith('ol') else \
        f'<div class="card {cls}"><h2>{escape(title)}</h2><ul class="{cls}">{lis}</ul></div>'


def exercise_page(ex, equipment):
    ex_exec = ex.get('execution') or {}
    params = ex.get('training_parameters') or {}
    slug = ex['slug']
    name = ex['name']
    muscles = ex.get('muscles') or {}
    primary = [pretty(m['muscle_slug']) for m in muscles.get('primary', [])]
    secondary = [pretty(m['muscle_slug']) for m in muscles.get('secondary', [])]
    stabilizers = [pretty(m['muscle_slug']) for m in muscles.get('stabilizers', [])]
    req = [equipment.get(e, pretty(e)) for e in ex.get('equipment_required', [])]
    opt = [equipment.get(e, pretty(e)) for e in ex.get('equipment_optional', [])]
    img = ILLUSTRATIONS / f'{slug}.svg'
    gif = ROOT / 'portal' / 'public' / 'data' / 'gifs' / f'{slug}.gif'
    illus_img = (f'<img src="../../../portal/public/data/illustrations/{escape(slug)}.svg" alt="{escape(name)} illustration">'
                 if img.exists() else '')
    demo_img = (f'<img src="../../../portal/public/data/gifs/{escape(slug)}.gif" alt="{escape(name)} demo">'
                if gif.exists() else '')
    illus = f'<div class="illus">{illus_img}{demo_img}</div>' if (illus_img or demo_img) else ''
    tags = ''.join(f'<span class="tag">{escape(t)}</span>' for t in [
        ex.get('category', ''), ex.get('difficulty_level', ''), ex.get('exercise_type', ''),
        ex.get('movement_pattern', ''), ex.get('laterality', '')] if t)
    body = f"""
<h1>{escape(name)}</h1>
<div class="tags">{tags}</div>
<p>{escape(ex.get('description', ''))}</p>
<div class="grid">
  <div class="card"><h2>Primary muscles</h2>{''.join(f'<div>{escape(m)}</div>' for m in primary) or '<div class="meta">None listed</div>'}
    <h2 style="margin-top:14px">Secondary muscles</h2>{''.join(f'<div>{escape(m)}</div>' for m in secondary) or '<div class="meta">None listed</div>'}
    {f'<h2 style="margin-top:14px">Stabilizers</h2>' + ''.join(f'<div>{escape(m)}</div>' for m in stabilizers) if stabilizers else ''}
  </div>
  <div class="card"><h2>Equipment</h2>
    {''.join(f'<div>{escape(e)}</div>' for e in req) or '<div class="meta">No equipment required</div>'}
    {(f'<h2 style="margin-top:14px">Optional</h2>' + ''.join(f'<div>{escape(e)}</div>' for e in opt)) if opt else ''}
  </div>
</div>
{illus}
{section('Starting position', [ex_exec.get('starting_position')] if ex_exec.get('starting_position') else [])}
{section('Setup', [ex_exec.get('setup_instructions')] if ex_exec.get('setup_instructions') else [])}
{section('Steps', as_list(ex_exec.get('steps')), 'ol')}
{section('Coaching cues', as_list(ex_exec.get('coaching_cues')))}
{section('Breathing', [ex_exec.get('breathing_instructions')] if ex_exec.get('breathing_instructions') else [])}
{section('Range of motion', [ex_exec.get('range_of_motion_guidance')] if ex_exec.get('range_of_motion_guidance') else [])}
{section('Tempo', [ex_exec.get('tempo_recommendations')] if ex_exec.get('tempo_recommendations') else [])}
{section('Common mistakes', as_list(ex_exec.get('common_mistakes')), 'bad')}
{section('Safety', as_list(ex_exec.get('safety_considerations')), 'warn')}
{section('Training', rep_summary(params) + ([f"Rest: {params.get('rest_periods')}"] if params.get('rest_periods') else []))}
<p class="meta">Dataset review status: {escape(str((ex.get('metadata') or {}).get('review_status', 'UNREVIEWED')))}. Content is for education and is not a substitute for coaching or medical advice.</p>
"""
    crumbs = '<a href="../index.html">Exercise guide</a> / ' + escape(name)
    return page(name, body, crumbs)


def index_page(exercises):
    rows = ''.join(
        f'<a href="exercises/{escape(e["slug"])}.html"><div>{escape(e["name"])}</div>'
        f'<span>{escape(e.get("movement_pattern", ""))} · {escape(e.get("difficulty_level", ""))}</span></a>'
        for e in exercises)
    body = f"""
<h1>Exercise guide</h1>
<p class="meta">{len(exercises)} exercises from the Open Exercise Intelligence dataset.</p>
<input class="search" id="q" placeholder="Search exercises…" autocomplete="off">
<div class="card list" id="list">{rows}</div>
<script>
const q=document.getElementById('q');const rows=[...document.querySelectorAll('#list a')];
q.addEventListener('input',()=>{{const t=q.value.trim().toLowerCase();rows.forEach(r=>r.style.display=r.textContent.toLowerCase().includes(t)?'':'none')}});
</script>
"""
    return page('Exercise guide', body, 'Exercise guide')


def main():
    exercises = json.loads(DATASET.read_text(encoding='utf-8'))['exercises']
    equipment = load_equipment()
    PAGES.mkdir(parents=True, exist_ok=True)
    for ex in exercises:
        slug = ''.join(c for c in ex['slug'].lower() if c.isalnum() or c == '-')
        (PAGES / f'{slug}.html').write_text(exercise_page(ex, equipment), encoding='utf-8')
    exercises_sorted = sorted(exercises, key=lambda e: e['name'].lower())
    (OUT / 'index.html').write_text(index_page(exercises_sorted), encoding='utf-8')
    print(f'Wrote index and {len(exercises)} exercise pages to {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
