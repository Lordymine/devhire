"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Briefcase } from "lucide-react";
import { likeCompany } from "./actions";
import { useTransition, useState } from "react";

interface Company {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  size: string | null;
  industry: string | null;
  location: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
  _count: {
    jobs: number;
  };
}

interface CompanyListProps {
  companies: Company[];
  canLike: boolean;
}

export function CompanyList({ companies, canLike }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nenhuma empresa encontrada com esses filtros.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} canLike={canLike} />
      ))}
    </div>
  );
}

function CompanyCard({ company, canLike }: { company: Company; canLike: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(false);
  const [matched, setMatched] = useState(false);

  const handleLike = () => {
    startTransition(async () => {
      const result = await likeCompany(company.id);
      if (result.success) {
        setLiked(true);
        if ((result as { matched?: boolean }).matched) {
          setMatched(true);
        }
      }
    });
  };

  const sizeLabels: Record<string, string> = {
    startup: "Startup (1-10)",
    small: "Pequena (11-50)",
    medium: "Media (51-200)",
    large: "Grande (201-1000)",
    enterprise: "Enterprise (1000+)",
  };

  return (
    <Card className={matched ? "border-green-500" : ""}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={company.logo || company.user.image || ""}
              alt={company.name}
            />
            <AvatarFallback>{company.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{company.name}</CardTitle>
            <CardDescription className="truncate">
              {company.industry || "Tecnologia"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {company.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {company.size && (
            <Badge variant="outline">{sizeLabels[company.size] || company.size}</Badge>
          )}
          {company.location && <span>{company.location}</span>}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span>{company._count.jobs} vagas ativas</span>
        </div>

        {canLike && (
          <Button
            variant={liked ? "secondary" : "default"}
            size="sm"
            className="w-full gap-2"
            onClick={handleLike}
            disabled={isPending || liked}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {matched ? "Match!" : liked ? "Curtido" : "Curtir"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
