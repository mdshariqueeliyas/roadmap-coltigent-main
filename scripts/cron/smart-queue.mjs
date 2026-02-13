#!/usr/bin/env node
/**
 * Smart Queue Job (PRD §5.2)
 * Trigger: 00:00 UTC Mondays
 * Logic: If Active count < max_concurrent_projects, scan Backlog for highest strategic_value project
 *        and send notification to Admin. Does NOT auto-activate; only recommends.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTENT = path.join(ROOT, '_content');
const projectsDir = path.join(CONTENT, 'projects');
const configPath = path.join(CONTENT, 'config.json');

function main() {
  if (!fs.existsSync(configPath)) {
    console.log('No config.json. Exiting.');
    return;
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const maxConcurrent = config.governance?.max_concurrent_projects ?? 5;

  if (!fs.existsSync(projectsDir)) {
    console.log('No projects directory. Exiting.');
    return;
  }
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.md'));
  let activeCount = 0;
  const backlog = [];

  for (const file of files) {
    const fullPath = path.join(projectsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontmatter } = matter(content);
    if (frontmatter.status === 'Active') activeCount++;
    if (frontmatter.status === 'Backlog' && frontmatter.scores?.strategic_value != null) {
      backlog.push({
        id: frontmatter.id,
        title: frontmatter.title,
        strategic_value: frontmatter.scores.strategic_value,
      });
    }
  }

  if (activeCount >= maxConcurrent) {
    console.log(`Smart Queue: at capacity (${activeCount}/${maxConcurrent}). No recommendation.`);
    return;
  }

  backlog.sort((a, b) => (b.strategic_value - a.strategic_value));
  const recommended = backlog[0];
  if (recommended) {
    console.log(
      `Capacity available (${activeCount}/${maxConcurrent}). Recommended next project: ${recommended.id} - ${recommended.title} (strategic_value: ${recommended.strategic_value})`
    );
    console.log('Send this as notification/alert to Admin. Do not auto-activate.');
  } else {
    console.log('Capacity available but no Backlog projects with strategic_value.');
  }
}

main();
