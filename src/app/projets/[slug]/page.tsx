import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNextProject, getProject, projects } from "@/data/projects";
import { ProjectView } from "./ProjectView";

type Params = { slug: string };

/** Pages projets générées statiquement au build */
export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { images: [project.cover.src] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectView project={project} next={getNextProject(slug)} />;
}
