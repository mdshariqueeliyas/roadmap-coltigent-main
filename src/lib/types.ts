/**
 * Shared types for Roadmap Engine (PRD §3)
 */

export interface DesignTokens {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography?: {
    heading_font: string;
    body_font: string;
  };
}

export interface Config {
  tenant_id: string;
  meta: {
    title: string;
    logo_url: string;
    favicon_url: string;
  };
  design_tokens?: DesignTokens;
  modules?: {
    enable_matrix: boolean;
    enable_gantt: boolean;
    enable_blog: boolean;
  };
  governance?: {
    fiscal_year_start: string;
    max_concurrent_projects: number;
    phases: string[];
  };
  taxonomies?: {
    departments?: string[];
    statuses?: string[];
  };
}

export interface ProjectDates {
  planned_start: string;
  planned_end: string;
  actual_start?: string;
}

export interface ProjectScores {
  strategic_value: number;
  complexity: number;
  confidence: number;
}

export interface ProjectFinancials {
  estimated_cost: number;
  projected_roi: number;
  currency: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  owner: string;
  department: string;
  phase: string;
  status: string;
  dates: ProjectDates;
  scores: ProjectScores;
  financials: ProjectFinancials;
  tags: string[];
  related_projects: string[];
  body: string;
  matrix?: {
    impact_normalized: number;
    effort_normalized: number;
    quadrant: 'Quick Wins' | 'Big Bets' | 'Fillers' | 'Time Sinks';
  };
}

export interface StatusUpdate {
  id: string;
  date: string;
  author: string;
  type: 'Weekly' | 'Monthly' | 'Milestone';
  highlight_projects: string[];
  sentiment: 'On Track' | 'At Risk' | 'Blocked';
  body: string;
}

export interface MasterData {
  builtAt: string;
  config: Config;
  projects: Project[];
  updates: StatusUpdate[];
  capacity: { activeCount: number; maxConcurrent: number; overCapacity: boolean };
}
