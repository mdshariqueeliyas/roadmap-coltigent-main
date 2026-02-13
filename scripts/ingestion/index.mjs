#!/usr/bin/env node
/**
 * Ingestion Engine (AI Pipeline) — PRD §2.1
 * 1. Normalize: PDF/Docx/Audio → plain text
 * 2. Entity Extraction (LLM): Extract project opportunities (title, rationale, deliverables)
 * 3. Heuristic Scoring: Impact and Effort from sentiment
 * 4. Output: Draft Markdown files in _content/_staging/ with confidence_score
 *
 * Run before moving drafts to _content/projects/ and running the Governance Engine.
 * Requires: OPENAI_API_KEY in environment (or pass via options).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeInterviewsDir } from './normalize.mjs';
import { extractProjectsWithLLM, confidenceScore } from './extract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTENT = path.join(ROOT, '_content');
const INTERVIEWS_DIR = path.join(CONTENT, 'interviews');
const STAGING_DIR = path.join(CONTENT, '_staging');

function loadConfig() {
  const configPath = path.join(CONTENT, 'config.json');
  if (!fs.existsSync(configPath)) {
    return { governance: { phases: ['Foundation', 'Acceleration', 'Scale'] }, taxonomies: { departments: ['Manufacturing', 'Supply Chain', 'Sales', 'After-Sales'] } };
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function nextFiscalPlaceholder(config) {
  const start = config?.governance?.fiscal_year_start || '2026-01-01';
  const y = parseInt(start.slice(0, 4), 10);
  return {
    planned_start: `${y}-04-01`,
    planned_end: `${y}-09-30`,
    actual_start: '',
  };
}

function draftToMarkdown(draft, index, config) {
  const id = `STG-${String(index + 1).padStart(3, '0')}`;
  const slug = slugify(draft.title) || `draft-${index + 1}`;
  const confidence = confidenceScore(draft);
  const phases = config?.governance?.phases ?? ['Foundation', 'Acceleration', 'Scale'];
  const departments = config?.taxonomies?.departments ?? ['Manufacturing', 'Supply Chain', 'Sales', 'After-Sales'];
  const department = departments.includes(draft.department) ? draft.department : departments[0];
  const phase = phases[0];
  const dates = nextFiscalPlaceholder(config);

  const frontmatter = {
    id,
    title: draft.title,
    slug,
    owner: draft.owner,
    department,
    phase,
    status: 'Backlog',
    confidence_score: confidence,
    dates: {
      planned_start: dates.planned_start,
      planned_end: dates.planned_end,
      ...(dates.actual_start && { actual_start: dates.actual_start }),
    },
    scores: {
      strategic_value: draft.impact,
      complexity: draft.effort,
      confidence,
    },
    financials: {
      estimated_cost: 0,
      projected_roi: 0,
      currency: 'USD',
    },
    tags: [],
    related_projects: [],
  };

  const body = [
    '# Executive Summary',
    draft.rationale || '(Rationale to be filled.)',
    '',
    '## Deliverables',
    ...(draft.deliverables && draft.deliverables.length
      ? draft.deliverables.map((d) => `- [ ] ${d}`)
      : ['- [ ] (To be defined)']),
  ].join('\n');

  const matter = stringifyFrontmatter(frontmatter);
  return `---\n${matter}\n---\n\n${body}\n`;
}

function stringifyFrontmatter(obj) {
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      if (Object.keys(v).length === 0) continue;
      lines.push(`${k}:`);
      for (const [k2, v2] of Object.entries(v)) {
        if (v2 === null || v2 === undefined) continue;
        const val = formatValue(v2);
        lines.push(`  ${k2}: ${val}`);
      }
    } else {
      lines.push(`${k}: ${formatValue(v)}`);
    }
  }
  return lines.join('\n');
}

function formatValue(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v;
  const s = String(v);
  if (s.includes('\n') || s.includes(':') || s.includes('#')) return JSON.stringify(s);
  return s;
}

async function main() {
  console.log('Ingestion Engine: starting...');
  const config = loadConfig();

  if (!fs.existsSync(INTERVIEWS_DIR)) {
    console.log('No _content/interviews directory. Create it and add transcript files, then re-run.');
    process.exit(0);
  }

  const { combined, sources } = await normalizeInterviewsDir(INTERVIEWS_DIR);
  if (!combined || combined.length < 50) {
    console.log('No sufficient interview text found in _content/interviews. Add .txt, .md, .pdf, or .docx files.');
    process.exit(0);
  }

  console.log(`Normalized ${sources.length} source(s), ${combined.length} chars.`);

  let projects;
  try {
    projects = await extractProjectsWithLLM(combined, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.INGESTION_MODEL || 'gpt-4o-mini',
    });
  } catch (err) {
    console.error('Ingestion Engine: LLM step failed.', err.message);
    if (err.message.includes('OPENAI_API_KEY')) {
      console.error('Set OPENAI_API_KEY in the environment to run the AI pipeline.');
    }
    process.exit(1);
  }

  if (!projects || projects.length === 0) {
    console.log('No project opportunities extracted. Try longer or more structured transcripts.');
    process.exit(0);
  }

  if (!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  }

  for (let i = 0; i < projects.length; i++) {
    const md = draftToMarkdown(projects[i], i, config);
    const slug = slugify(projects[i].title) || `draft-${i + 1}`;
    const filename = `${slug}.md`;
    const filePath = path.join(STAGING_DIR, filename);
    fs.writeFileSync(filePath, md, 'utf-8');
    console.log(`  Wrote _staging/${filename}`);
  }

  console.log(`Ingestion Engine: wrote ${projects.length} draft(s) to _content/_staging/. Review and move to _content/projects/ then run governance.`);
}

main();
