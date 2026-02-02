import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  dev: {
    id: string;
    title: string | null;
    skills: string[];
    user: {
      name: string | null;
      image: string | null;
    };
  };
  createdAt: Date;
}

interface MatchListProps {
  matches: Match[];
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum match ainda. Continue explorando desenvolvedores!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={match.dev.user.image || ""}
              alt={match.dev.user.name || ""}
            />
            <AvatarFallback>
              {match.dev.user.name?.charAt(0).toUpperCase() || "D"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {match.dev.user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {match.dev.title || "Desenvolvedor"}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {match.dev.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs py-0">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
