#!/usr/bin/env node
/**
 * Governance Engine (PRD §2.1)
 * Validates _content, applies temporal/capacity logic, computes matrix quadrants, outputs master_data.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { projectFrontmatterSchema, updateFrontmatterSchema, configSchema } from './schemas.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTENT = path.join(ROOT, '_content');
const PUBLIC = path.join(ROOT, 'public');
const OUTPUT_FILE = path.join(PUBLIC, 'master_data.json');

const TODAY = new Date();
const todayStr = TODAY.toISOString().slice(0, 10);

function normalizeScore1To10To0To100(value) {
  const v = Math.max(0, Math.min(10, value));
  return Math.round((v / 10) * 100);
}

function getQuadrantLabel(impact100, effort100) {
  const highImpact = impact100 >= 50;
  const highEffort = effort100 >= 50;
  if (highImpact && !highEffort) return 'Quick Wins';
  if (highImpact && highEffort) return 'Big Bets';
  if (!highImpact && !highEffort) return 'Fillers';
  return 'Time Sinks';
}

function loadConfig() {
  const configPath = path.join(CONTENT, 'config.json');
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return configSchema.parse(raw);
}

function loadProjects(config) {
  const projectsDir = path.join(CONTENT, 'projects');
  if (!fs.existsSync(projectsDir)) return [];
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.md'));
  const projectIds = new Set();
  const projects = [];

  for (const file of files) {
    const fullPath = path.join(projectsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    const parsed = projectFrontmatterSchema.safeParse(frontmatter);
    if (!parsed.success) {
      console.error(`Validation failed for ${file}:`, parsed.error.flatten());
      throw new Error(`Invalid project frontmatter: ${file}`);
    }
    const proj = parsed.data;

    if (projectIds.has(proj.id)) throw new Error(`Duplicate project id: ${proj.id}`);
    projectIds.add(proj.id);

    const departments = config.taxonomies?.departments ?? [];
    const phases = config.governance?.phases ?? [];
    if (departments.length && !departments.includes(proj.department)) {
      throw new Error(`Project ${proj.id}: department "${proj.department}" not in config taxonomies`);
    }
    if (phases.length && !phases.includes(proj.phase)) {
      throw new Error(`Project ${proj.id}: phase "${proj.phase}" not in config governance.phases`);
    }

    projects.push({ ...proj, body });
  }

  for (const proj of projects) {
    for (const refId of proj.related_projects) {
      if (!projectIds.has(refId)) {
        throw new Error(`Project ${proj.id} references non-existent project ${refId}`);
      }
    }
  }

  return projects;
}

function applyTemporalLogic(projects) {
  return projects.map((p) => {
    let status = p.status;
    const plannedStart = p.dates.planned_start;
    const plannedEnd = p.dates.planned_end;

    if (status === 'Queued' && plannedStart <= todayStr) {
      status = 'Active';
    }
    if (status === 'Active' && plannedEnd < todayStr) {
      status = 'Overdue';
    }
    return { ...p, status };
  });
}

function applyMatrixAndNormalize(projects) {
  return projects.map((p) => {
    const impact100 = normalizeScore1To10To0To100(p.scores.strategic_value);
    const effort100 = normalizeScore1To10To0To100(p.scores.complexity);
    const quadrant = getQuadrantLabel(impact100, effort100);
    return {
      ...p,
      matrix: {
        impact_normalized: impact100,
        effort_normalized: effort100,
        quadrant,
      },
    };
  });
}

function loadUpdates() {
  const updatesDir = path.join(CONTENT, 'updates');
  if (!fs.existsSync(updatesDir)) return [];
  const files = fs.readdirSync(updatesDir).filter((f) => f.endsWith('.md'));
  const updates = [];

  for (const file of files) {
    const fullPath = path.join(updatesDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);
    const parsed = updateFrontmatterSchema.safeParse(frontmatter);
    if (!parsed.success) {
      console.error(`Update validation failed for ${file}:`, parsed.error.flatten());
      continue;
    }
    updates.push({ ...parsed.data, body });
  }

  updates.sort((a, b) => (b.date < a.date ? -1 : 1));
  return updates;
}

function main() {
  console.log('Governance Engine: loading config and content...');
  const config = loadConfig();
  let projects = loadProjects(config);
  projects = applyTemporalLogic(projects);
  const activeCount = projects.filter((p) => p.status === 'Active').length;
  const maxConcurrent = config.governance?.max_concurrent_projects ?? 999;
  const capacityWarning = activeCount > maxConcurrent;

  projects = applyMatrixAndNormalize(projects);
  const updates = loadUpdates();

  const masterData = {
    builtAt: new Date().toISOString(),
    config,
    projects,
    updates,
    capacity: { activeCount, maxConcurrent, overCapacity: capacityWarning },
  };

  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterData, null, 2), 'utf-8');
  const assetsSrc = path.join(CONTENT, 'assets');
  const assetsDest = path.join(PUBLIC, 'assets');
  if (fs.existsSync(assetsSrc)) {
    if (!fs.existsSync(assetsDest)) fs.mkdirSync(assetsDest, { recursive: true });
    for (const f of fs.readdirSync(assetsSrc)) {
      const src = path.join(assetsSrc, f);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, path.join(assetsDest, f));
      }
    }
    console.log('Copied _content/assets to public/assets.');
  }
  console.log(`Wrote ${OUTPUT_FILE} (${projects.length} projects, ${updates.length} updates).`);
}

main();
