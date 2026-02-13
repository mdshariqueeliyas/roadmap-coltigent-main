#!/usr/bin/env node
/**
 * Step 1: Normalization (PRD §2.1 - Ingestion Engine)
 * Converts PDF/Docx/Audio inputs into plain text. Supports .txt, .md, .pdf, .docx.
 */

import fs from 'fs';
import path from 'path';

const TEXT_EXT = ['.txt', '.md'];
const BINARY_EXT = ['.pdf', '.docx', '.doc'];

/**
 * Read plain text file as UTF-8.
 */
function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Extract text from PDF using pdf-parse (optional dependency).
 */
async function extractPdf(filePath) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = fs.readFileSync(filePath);
    const { text } = await pdfParse(data);
    return text || '';
  } catch (err) {
    console.warn(`[normalize] PDF parse skipped for ${filePath}:`, err.message);
    return '';
  }
}

/**
 * Extract text from .docx using mammoth (optional dependency).
 */
async function extractDocx(filePath) {
  try {
    const mammoth = (await import('mammoth')).default;
    const buf = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value || '';
  } catch (err) {
    console.warn(`[normalize] Docx parse skipped for ${filePath}:`, err.message);
    return '';
  }
}

/**
 * Normalize a single file to plain text.
 * @param {string} filePath - Full path to the file
 * @returns {Promise<{ sourcePath: string, text: string }>}
 */
export async function normalizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let text = '';

  if (TEXT_EXT.includes(ext)) {
    text = readTextFile(filePath);
  } else if (ext === '.pdf') {
    text = await extractPdf(filePath);
  } else if (['.docx', '.doc'].includes(ext)) {
    text = await extractDocx(filePath);
  } else {
    return { sourcePath: filePath, text: '', skipped: true };
  }

  return { sourcePath: filePath, text: (text || '').trim(), skipped: false };
}

/**
 * List all supported interview files in a directory (non-recursive).
 */
export function listInterviewFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return (TEXT_EXT.includes(ext) || BINARY_EXT.includes(ext)) && !f.startsWith('.');
    })
    .map((f) => path.join(dir, f));
}

/**
 * Normalize all interview files in a directory and return combined text with source labels.
 * @param {string} interviewsDir - Path to _content/interviews
 * @returns {Promise<{ combined: string, sources: Array<{ path: string, text: string }> }>}
 */
export async function normalizeInterviewsDir(interviewsDir) {
  const files = listInterviewFiles(interviewsDir);
  const sources = [];
  const parts = [];

  for (const filePath of files) {
    const result = await normalizeFile(filePath);
    if (result.skipped || !result.text) continue;
    sources.push({ path: result.sourcePath, text: result.text });
    const base = path.basename(result.sourcePath);
    parts.push(`--- Source: ${base} ---\n${result.text}`);
  }

  const combined = parts.join('\n\n');
  return { combined, sources };
}
