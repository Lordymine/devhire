import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Match {
  id: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
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
        Nenhum match ainda. Continue explorando!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div
          key={match.id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={match.company.logo || match.company.user.image || ""}
              alt={match.company.name}
            />
            <AvatarFallback>
              {match.company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{match.company.name}</p>
            <p className="text-xs text-muted-foreground">
              Match em{" "}
              {new Date(match.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
