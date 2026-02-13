/**
 * Zod schemas for PRD-compliant validation (Governance Engine)
 */

import { z } from 'zod';

const datesSchema = z.object({
  planned_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  planned_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  actual_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const scoresSchema = z.object({
  strategic_value: z.number().min(0).max(10),
  complexity: z.number().min(0).max(10),
  confidence: z.number().min(0).max(1),
});

const financialsSchema = z.object({
  estimated_cost: z.number(),
  projected_roi: z.number(),
  currency: z.string().length(3),
});

export const projectFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  owner: z.string().min(1),
  department: z.string().min(1),
  phase: z.string().min(1),
  status: z.enum(['Backlog', 'Queued', 'Active', 'Paused', 'Complete']),
  dates: datesSchema,
  scores: scoresSchema,
  financials: financialsSchema,
  tags: z.array(z.string()).default([]),
  related_projects: z.array(z.string()).default([]),
}).refine(
  (data) => new Date(data.dates.planned_end) >= new Date(data.dates.planned_start),
  { message: 'planned_end must be after planned_start', path: ['dates'] }
);

export const updateFrontmatterSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  author: z.string().min(1),
  type: z.enum(['Weekly', 'Monthly', 'Milestone']),
  highlight_projects: z.array(z.string()).default([]),
  sentiment: z.enum(['On Track', 'At Risk', 'Blocked']),
});

export const configSchema = z.object({
  tenant_id: z.string(),
  meta: z.object({
    title: z.string(),
    logo_url: z.string(),
    favicon_url: z.string(),
  }),
  design_tokens: z.object({
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string(),
    }),
    typography: z.object({
      heading_font: z.string(),
      body_font: z.string(),
    }),
  }).optional(),
  modules: z.object({
    enable_matrix: z.boolean(),
    enable_gantt: z.boolean(),
    enable_blog: z.boolean(),
  }).optional(),
  governance: z.object({
    fiscal_year_start: z.string(),
    max_concurrent_projects: z.number(),
    phases: z.array(z.string()),
  }).optional(),
  taxonomies: z.object({
    departments: z.array(z.string()).optional(),
    statuses: z.array(z.string()).optional(),
  }).optional(),
});
