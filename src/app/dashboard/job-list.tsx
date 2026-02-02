"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pause, Play, Trash2 } from "lucide-react";
import { updateJobStatus, deleteJob } from "./actions";
import { useTransition } from "react";

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string | null;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  type: string;
  status: string;
  createdAt: Date;
}

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  const [isPending, startTransition] = useTransition();

  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma vaga publicada ainda. Crie sua primeira vaga abaixo!
      </p>
    );
  }

  const handleStatusChange = (jobId: string, newStatus: string) => {
    startTransition(async () => {
      await updateJobStatus(jobId, newStatus);
    });
  };

  const handleDelete = (jobId: string) => {
    if (confirm("Tem certeza que deseja excluir esta vaga?")) {
      startTransition(async () => {
        await deleteJob(jobId);
      });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativa</Badge>;
      case "paused":
        return <Badge variant="secondary">Pausada</Badge>;
      case "closed":
        return <Badge variant="outline">Fechada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-start justify-between p-4 border rounded-lg"
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{job.title}</h4>
              {statusBadge(job.status)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {job.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 5}
                </Badge>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              {job.location && <span>{job.location}</span>}
              {job.remote && <span>Remoto</span>}
              <span>{job.type}</span>
              {(job.salaryMin || job.salaryMax) && (
                <span>
                  {job.salaryMin && `R$ ${job.salaryMin.toLocaleString()}`}
                  {job.salaryMin && job.salaryMax && " - "}
                  {job.salaryMax && `R$ ${job.salaryMax.toLocaleString()}`}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isPending}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {job.status === "active" ? (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(job.id, "paused")}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(job.id, "active")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Ativar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(job.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
