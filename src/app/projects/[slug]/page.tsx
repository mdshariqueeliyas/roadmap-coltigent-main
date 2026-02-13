import fs from 'fs';
import path from 'path';
import ProjectDetailClient from './ProjectDetailClient';

export async function generateStaticParams() {
  const p = path.join(process.cwd(), 'public', 'master_data.json');
  if (!fs.existsSync(p)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return (data.projects ?? []).map((proj: { slug: string }) => ({ slug: proj.slug }));
  } catch {
    return [];
  }
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />;
}
