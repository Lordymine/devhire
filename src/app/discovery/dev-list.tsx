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
import { Heart } from "lucide-react";
import { likeDev } from "./actions";
import { useTransition, useState } from "react";

interface Dev {
  id: string;
  title: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface DevListProps {
  devs: Dev[];
  canLike: boolean;
}

export function DevList({ devs, canLike }: DevListProps) {
  if (devs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nenhum desenvolvedor encontrado com esses filtros.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {devs.map((dev) => (
        <DevCard key={dev.id} dev={dev} canLike={canLike} />
      ))}
    </div>
  );
}

function DevCard({ dev, canLike }: { dev: Dev; canLike: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(false);
  const [matched, setMatched] = useState(false);

  const handleLike = () => {
    startTransition(async () => {
      const result = await likeDev(dev.id);
      if (result.success) {
        setLiked(true);
        if ((result as { matched?: boolean }).matched) {
          setMatched(true);
        }
      }
    });
  };

  return (
    <Card className={matched ? "border-green-500" : ""}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={dev.user.image || ""} alt={dev.user.name || ""} />
            <AvatarFallback>
              {dev.user.name?.charAt(0).toUpperCase() || "D"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{dev.user.name}</CardTitle>
            <CardDescription className="truncate">
              {dev.title || "Desenvolvedor"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {dev.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{dev.bio}</p>
        )}

        {dev.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dev.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {dev.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{dev.skills.length - 5}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {dev.experience && <span>{dev.experience} exp</span>}
          {dev.location && <span>{dev.location}</span>}
          {(dev.salaryMin || dev.salaryMax) && (
            <span>
              {dev.salaryMin && `R$ ${dev.salaryMin.toLocaleString()}`}
              {dev.salaryMin && dev.salaryMax && " - "}
              {dev.salaryMax && `R$ ${dev.salaryMax.toLocaleString()}`}
            </span>
          )}
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
