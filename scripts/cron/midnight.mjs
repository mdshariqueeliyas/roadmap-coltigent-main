#!/usr/bin/env node
/**
 * Midnight Job (PRD §5.1)
 * Trigger: 00:00 UTC daily (e.g. GitHub Actions / Vercel Cron)
 * Logic: Update Queued -> Active when planned_start <= TODAY; flag Active as Overdue when planned_end < TODAY.
 * Does not auto-complete; requires human intervention for completion.
 * In production this would rewrite _content/projects/*.md and trigger a rebuild.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTENT = path.join(ROOT, '_content');
const projectsDir = path.join(CONTENT, 'projects');

const TODAY = new Date();
const todayStr = TODAY.toISOString().slice(0, 10);

function main() {
  if (!fs.existsSync(projectsDir)) {
    console.log('No projects directory. Exiting.');
    return;
  }
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.md'));
  const events = [];

  for (const file of files) {
    const fullPath = path.join(projectsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);
    let status = frontmatter.status;
    const plannedStart = frontmatter.dates?.planned_start;
    const plannedEnd = frontmatter.dates?.planned_end;

    if (status === 'Queued' && plannedStart && plannedStart <= todayStr) {
      status = 'Active';
      events.push(`Auto-activated project: ${frontmatter.id} (${frontmatter.title})`);
    }
    if (status === 'Active' && plannedEnd && plannedEnd < todayStr) {
      status = 'Overdue';
      events.push(`Flagged as Overdue: ${frontmatter.id} (${frontmatter.title})`);
    }

    if (status !== frontmatter.status) {
      frontmatter.status = status;
      const newContent = matter.stringify(body, frontmatter, { lineWidth: 1000 });
      fs.writeFileSync(fullPath, newContent, 'utf-8');
    }
  }

  events.forEach((e) => console.log(e));
  if (events.length === 0) {
    console.log('Midnight job: no status changes.');
  } else {
    console.log('Midnight job: file(s) updated. Trigger a new deployment to reflect changes.');
  }
}

main();
