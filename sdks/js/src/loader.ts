/**
 * Node.js filesystem loader for the OEI exercise dataset.
 * Not bundled in the browser build.
 */

import fs from 'fs';
import path from 'path';
import type { Exercise } from './types';

export async function loadExercisesFromDir(dir: string): Promise<Exercise[]> {
  const exercises: Exercise[] = [];
  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.json')) {
        try {
          const raw = fs.readFileSync(full, 'utf8');
          exercises.push(JSON.parse(raw) as Exercise);
        } catch (_) {}
      }
    }
  }
  walk(dir);
  return exercises;
}
