"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProjectForm from "@/components/ProjectForm";
import { ProjectRow, apiGet } from "@/lib/api";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ project: ProjectRow }>(
          `/api/admin/projects/${id}`,
        );
        setProject(data.project);
      } catch {
        setNotFound(true);
      }
    })();
  }, [id]);

  if (notFound) {
    return (
      <div>
        <p className="mb-2 text-muted">Projet introuvable.</p>
        <Link href="/dashboard/projects" className="link-mono">
          ← Retour aux projets
        </Link>
      </div>
    );
  }

  if (!project) return <p className="text-muted">Chargement…</p>;

  return <ProjectForm mode="edit" project={project} />;
}
