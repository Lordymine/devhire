import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Building2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  requirements: string[];
  location: string | null;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  type: string;
  company: {
    name: string;
    logo: string | null;
  };
}

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nenhuma vaga encontrada com esses filtros.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              {job.company.name}
            </CardDescription>
          </div>
          <Badge variant="outline">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {(job.location || job.remote) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location && job.remote
                ? `${job.location} (Remoto)`
                : job.remote
                ? "Remoto"
                : job.location}
            </div>
          )}

          {(job.salaryMin || job.salaryMax) && (
            <span>
              {job.salaryMin && `R$ ${job.salaryMin.toLocaleString()}`}
              {job.salaryMin && job.salaryMax && " - "}
              {job.salaryMax && `R$ ${job.salaryMax.toLocaleString()}`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
