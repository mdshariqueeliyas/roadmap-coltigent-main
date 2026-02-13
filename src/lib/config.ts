/**
 * Server-side config loader for _content/config.json.
 * Used by layout metadata (title, favicon) so the document head reflects config without waiting for client data.
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import type { Config } from '@/lib/types';

const CONTENT_DIR = path.join(process.cwd(), '_content');
const CONFIG_PATH = path.join(CONTENT_DIR, 'config.json');

let cached: Config | null = null;

export function getConfig(): Config | null {
  if (cached !== null) return cached;
  if (!existsSync(CONFIG_PATH)) return null;
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    cached = JSON.parse(raw) as Config;
    return cached;
  } catch {
    return null;
  }
}
