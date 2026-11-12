#!/usr/bin/env python3
"""Build visualization-engine/mappings/muscle-mapping.json from the Z-Anatomy object snapshot.

Each OEI muscle slug is matched to Z-Anatomy objects whose names end in .l or .r.
Variant objects (.el, .ol, .o1, .j and similar) are never selected.
Slugs with no match are listed under unresolved so they are not highlighted by mistake.

Usage: python3 visualization-engine/scripts/build_muscle_mapping.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT = ROOT / 'visualization-engine' / 'mappings' / 'zanatomy-muscle-objects.json'
OUT = ROOT / 'visualization-engine' / 'mappings' / 'muscle-mapping.json'

PATTERNS = {
    'adductor-brevis': [r'^Adductor brevis'],
    'adductor-longus': [r'^Adductor longus'],
    'adductor-magnus': [r'^Adductor magnus'],
    'adductors': [r'^Adductor (brevis|longus|magnus)', r'^\(Adductor minimus\)'],
    'anterior-deltoid': [r'^Clavicular part of deltoid'],
    'deltoid-anterior': [r'^Clavicular part of deltoid'],
    'deltoid-lateral': [r'^Acromial part of deltoid'],
    'medial-deltoid': [r'^Acromial part of deltoid'],
    'deltoid-posterior': [r'^Scapular spinal part of deltoid'],
    'posterior-deltoid': [r'^Scapular spinal part of deltoid'],
    'biceps': [r'^Long head of biceps brachii', r'^Short head of biceps brachii'],
    'biceps-brachii': [r'^Long head of biceps brachii', r'^Short head of biceps brachii'],
    'biceps-brachii-long-head': [r'^Long head of biceps brachii'],
    'biceps-brachii-short-head': [r'^Short head of biceps brachii'],
    'biceps-femoris': [r'^Long head of biceps femoris', r'^Short head of biceps femoris'],
    'biceps-femoris-long-head': [r'^Long head of biceps femoris'],
    'biceps-femoris-short-head': [r'^Short head of biceps femoris'],
    'brachialis': [r'^Brachialis muscle'],
    'brachioradialis': [r'^Brachioradialis muscle'],
    'erector-spinae': [r'^Iliocostalis (lumborum|thoracis) muscle', r'^Longissimus thoracis muscle', r'^Spinalis thoracis muscle'],
    'iliocostalis': [r'^Iliocostalis (lumborum|thoracis) muscle'],
    'longissimus': [r'^Longissimus thoracis muscle'],
    'extensor-carpi-radialis': [r'^Extensor carpi radialis'],
    'flexor-carpi-radialis': [r'^Flexor carpi radialis'],
    'flexor-carpi-ulnaris': [r'^(Humeral|Ulnar) head of flexor carpi ulnaris'],
    'external-oblique': [r'^External abdominal oblique muscle'],
    'internal-oblique': [r'^Internal abdominal oblique muscle'],
    'obliques': [r'^External abdominal oblique muscle', r'^Internal abdominal oblique muscle'],
    'gastrocnemius-lateral': [r'^Lateral head of gastrocnemius'],
    'gastrocnemius-medial': [r'^Medial head of gastrocnemius'],
    'gluteus-maximus': [r'^Gluteus maximus muscle'],
    'gluteus-medius': [r'^Gluteus medius muscle'],
    'gluteus-minimus': [r'^Gluteus minimus muscle'],
    'gracilis': [r'^Gracilis muscle'],
    'hamstrings': [r'^Long head of biceps femoris', r'^Short head of biceps femoris', r'^Semitendinosus muscle', r'^Semimembranosus muscle'],
    'iliacus': [r'^Iliacus muscle'],
    'infraspinatus': [r'^Infraspinatus muscle'],
    'latissimus-dorsi': [r'^Latissimus dorsi muscle'],
    'lower-trapezius': [r'^Descending part of trapezius'],
    'trapezius-lower': [r'^Descending part of trapezius'],
    'middle-trapezius': [r'^Transverse part of trapezius'],
    'trapezius-middle': [r'^Transverse part of trapezius'],
    'trapezius-upper': [r'^Ascending part of trapezius'],
    'pectineus': [r'^Pectineus muscle'],
    'pectoralis-major': [r'^Sternocostal head of pectoralis major', r'^Clavicular head of pectoralis major'],
    'pectoralis-major-clavicular': [r'^Clavicular head of pectoralis major'],
    'pectoralis-major-sternal': [r'^Sternocostal head of pectoralis major'],
    'pectoralis-minor': [r'^Pectoralis minor muscle'],
    'psoas-major': [r'^Psoas major'],
    'quadriceps': [r'^Rectus femoris muscle', r'^Vastus (intermedius|lateralis|medialis) muscle'],
    'rectus-abdominis': [r'^Rectus abdominis muscle'],
    'rectus-femoris': [r'^Rectus femoris muscle'],
    'rhomboid-major': [r'^Rhomboid major muscle'],
    'rhomboid-minor': [r'^Rhomboid minor muscle'],
    'rhomboids': [r'^Rhomboid major muscle', r'^Rhomboid minor muscle'],
    'semimembranosus': [r'^Semimembranosus muscle'],
    'semitendinosus': [r'^Semitendinosus muscle'],
    'serratus-anterior': [r'^Serratus anterior muscle'],
    'soleus': [r'^Soleus muscle'],
    'subscapularis': [r'^Subscapularis muscle'],
    'supraspinatus': [r'^Supraspinatus muscle'],
    'tensor-fasciae-latae': [r'^Tensor fasciae latae'],
    'teres-major': [r'^Teres major muscle'],
    'teres-minor': [r'^Teres minor muscle'],
    'tibialis-anterior': [r'^Tibialis anterior muscle'],
    'transverse-abdominis': [r'^Transversus abdominis muscle'],
    'triceps-brachii': [r'^Lateral head of triceps brachii', r'^Long head of triceps brachii', r'^Medial head of triceps brachii'],
    'triceps-lateral-head': [r'^Lateral head of triceps brachii'],
    'triceps-long-head': [r'^Long head of triceps brachii'],
    'triceps-medial-head': [r'^Medial head of triceps brachii'],
    'vastus-intermedius': [r'^Vastus intermedius muscle'],
    'vastus-lateralis': [r'^Vastus lateralis muscle'],
    'vastus-medialis': [r'^Vastus medialis muscle'],
}

REVIEW_NOTES = {
    'biceps-brachii-long-head': 'Z-Anatomy splits the heads as separate objects. Confirm the head matches the OEI definition.',
    'biceps-brachii-short-head': 'Z-Anatomy splits the heads as separate objects. Confirm the head matches the OEI definition.',
    'biceps-femoris-long-head': 'Z-Anatomy splits the heads as separate objects. Confirm the head matches the OEI definition.',
    'biceps-femoris-short-head': 'Z-Anatomy splits the heads as separate objects. Confirm the head matches the OEI definition.',
}


def resolve(patterns, objects):
    matched = []
    for pat in patterns:
        rx = re.compile(pat)
        matched.extend(o for o in objects if rx.search(o))
    seen = []
    for o in matched:
        if o not in seen:
            seen.append(o)
    return seen


def main():
    objects = json.loads(SNAPSHOT.read_text(encoding='utf-8'))['core_objects_ending_l_or_r']
    muscles = {}
    unresolved = []
    for slug, patterns in sorted(PATTERNS.items()):
        found = resolve(patterns, objects)
        entry = {'mesh_objects': found}
        if slug in REVIEW_NOTES:
            entry['review_note'] = REVIEW_NOTES[slug]
        if not found:
            unresolved.append(slug)
        muscles[slug] = entry

    doc = {
        'mapping_version': '0.2.0',
        'status': 'DRAFT_UNREVIEWED',
        'source_model': {
            'name': 'Z-Anatomy Startup.blend',
            'source': 'https://github.com/Z-Anatomy/Models-of-human-anatomy (Z-Anatomy.zip)',
            'licence': 'CC BY-SA 4.0',
        },
        'selection_rule': 'Only objects whose names end in .l or .r. Variant objects (.el, .ol, .or, .o1 and similar) are excluded.',
        'muscles': muscles,
        'unresolved': unresolved,
    }
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Mapped {len(muscles) - len(unresolved)} of {len(muscles)} OEI slugs. Unresolved: {unresolved}')


if __name__ == '__main__':
    main()
