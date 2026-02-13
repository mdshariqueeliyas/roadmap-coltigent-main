#!/usr/bin/env node
/**
 * Step 2 & 3: Entity Extraction + Heuristic Scoring (PRD §2.1 - Ingestion Engine)
 * Uses an LLM to extract project opportunities and assign Impact/Effort scores from sentiment.
 */

import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an analyst for a strategic roadmap engine. Analyze the provided interview or meeting transcripts and extract discrete project opportunities (initiatives) that were mentioned or implied.

For each initiative you identify:
1. title: A short, clear project title (e.g. "Factory Predictive Maintenance Rollout").
2. rationale: One paragraph explaining the business rationale and why it matters.
3. deliverables: An array of 2-5 concrete deliverable items (e.g. "Install sensor kits on critical presses", "Build fault-risk dashboard").
4. impact: Strategic value / impact score from 0 to 10. Use sentiment cues: "urgent", "critical", "board-level", "must-have" → high (7-10); "nice to have" → lower (3-5).
5. effort: Complexity / effort score from 0 to 10. Use cues: "complex", "years", "multi-site", "integration" → high (6-10); "quick", "pilot", "single plant" → lower (2-5).
6. department: One of: Manufacturing, Supply Chain, Sales, After-Sales. Infer from context or use "Manufacturing" if unclear.
7. owner: A plausible role or title (e.g. "VP Manufacturing", "Chief Procurement Officer").

Respond with a JSON array only, no markdown or extra text. Each element must have: title, rationale, deliverables (array of strings), impact (number 0-10), effort (number 0-10), department (string), owner (string).
Example format:
[{"title":"...","rationale":"...","deliverables":["...","..."],"impact":8,"effort":4,"department":"Manufacturing","owner":"VP Manufacturing"}]`;

/**
 * Call OpenAI (or compatible API) to extract projects from combined transcript text.
 * @param {string} combinedText - Normalized plain text from all interviews
 * @param {object} options - { apiKey?, model?, baseURL? }
 * @returns {Promise<Array<{ title: string, rationale: string, deliverables: string[], impact: number, effort: number, department: string, owner: string }>>}
 */
export async function extractProjectsWithLLM(combinedText, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Set the env var or pass options.apiKey.');
  }

  const client = new OpenAI({
    apiKey,
    ...(options.baseURL && { baseURL: options.baseURL }),
  });

  const model = options.model || 'gpt-4o-mini';
  const maxTokens = options.maxTokens || 4096;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Extract project opportunities from these transcripts:\n\n${combinedText.slice(0, 120000)}` },
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) return [];

  // Strip possible markdown code fence
  let jsonStr = content;
  const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();

  try {
    const raw = JSON.parse(jsonStr);
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map((item) => ({
      title: String(item.title || 'Untitled Initiative'),
      rationale: String(item.rationale || ''),
      deliverables: Array.isArray(item.deliverables) ? item.deliverables.map(String) : [],
      impact: clampScore(Number(item.impact) || 5, 0, 10),
      effort: clampScore(Number(item.effort) || 5, 0, 10),
      department: String(item.department || 'Manufacturing'),
      owner: String(item.owner || 'TBD'),
    }));
  } catch (e) {
    console.error('[extract] Failed to parse LLM response as JSON:', e.message);
    return [];
  }
}

function clampScore(v, min, max) {
  const n = Number(v);
  if (Number.isNaN(n)) return 5;
  return Math.max(min, Math.min(max, Math.round(n * 10) / 10));
}

/**
 * Compute a 0-1 confidence score for a draft based on completeness and scores.
 */
export function confidenceScore(project) {
  let c = 0.5;
  if (project.title && project.title.length > 2) c += 0.15;
  if (project.rationale && project.rationale.length > 50) c += 0.15;
  if (Array.isArray(project.deliverables) && project.deliverables.length >= 2) c += 0.1;
  if (typeof project.impact === 'number' && typeof project.effort === 'number') c += 0.1;
  return Math.min(1, Math.round(c * 100) / 100);
}
