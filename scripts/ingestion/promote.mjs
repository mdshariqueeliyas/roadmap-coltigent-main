#!/usr/bin/env node
/**
 * Move generated .md files from _content/_staging/ to _content/projects/.
 * Assigns next available PRJ-xxx ID and writes as PRJ-xxx.md.
 * Removes files from staging after successful copy.
 *
 * Usage: npm run staging:promote  (from repo root)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const STAGING_DIR = path.join(ROOT, '_content', '_staging');
const PROJECTS_DIR = path.join(ROOT, '_content', 'projects');

function nextProjectNumber() {
  if (!fs.existsSync(PROJECTS_DIR)) return 1;
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.md') && /^PRJ-\d+\.md$/i.test(f));
  if (files.length === 0) return 1;
  const numbers = files.map((f) => parseInt(f.replace(/^PRJ-(\d+)\.md$/i, '$1'), 10));
  return Math.max(...numbers) + 1;
}

function promoteStagingToProjects() {
  if (!fs.existsSync(STAGING_DIR)) {
    console.log('No _content/_staging directory found. Nothing to promote.');
    return;
  }

  const mdFiles = fs.readdirSync(STAGING_DIR).filter((f) => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.log('No .md files in _content/_staging. Nothing to promote.');
    return;
  }

  let nextNum = nextProjectNumber();

  for (const file of mdFiles) {
    const srcPath = path.join(STAGING_DIR, file);
    const content = fs.readFileSync(srcPath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    const newId = `PRJ-${String(nextNum).padStart(3, '0')}`;
    frontmatter.id = newId;

    const outPath = path.join(PROJECTS_DIR, `${newId}.md`);
    const outContent = matter.stringify(body, frontmatter, { lineWidth: false });

    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    fs.writeFileSync(outPath, outContent, 'utf-8');
    fs.unlinkSync(srcPath);

    console.log(`Promoted ${file} → ${newId}.md`);
    nextNum += 1;
  }

  console.log(`Done. ${mdFiles.length} file(s) moved to _content/projects/`);
}

promoteStagingToProjects();
