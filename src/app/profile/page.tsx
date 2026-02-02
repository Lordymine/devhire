import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";
import { MatchList } from "./match-list";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.type !== "DEV") {
    redirect("/dashboard");
  }

  const devProfile = await prisma.devProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      matches: {
        include: {
          company: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  const user = session.user;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() || "D"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user.name}</CardTitle>
              <CardDescription>
                {devProfile?.title || "Desenvolvedor"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devProfile?.bio && (
                <p className="text-sm text-muted-foreground mb-4">
                  {devProfile.bio}
                </p>
              )}

              {devProfile?.skills && devProfile.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {devProfile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                {devProfile?.experience && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experiencia</span>
                    <span>{devProfile.experience}</span>
                  </div>
                )}
                {devProfile?.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Localizacao</span>
                    <span>{devProfile.location}</span>
                  </div>
                )}
                {(devProfile?.salaryMin || devProfile?.salaryMax) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pretensao</span>
                    <span>
                      {devProfile.salaryMin && `R$ ${devProfile.salaryMin.toLocaleString()}`}
                      {devProfile.salaryMin && devProfile.salaryMax && " - "}
                      {devProfile.salaryMax && `R$ ${devProfile.salaryMax.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              {(devProfile?.github || devProfile?.linkedin || devProfile?.portfolio) && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    {devProfile?.github && (
                      <a
                        href={devProfile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {devProfile?.linkedin && (
                      <a
                        href={devProfile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {devProfile?.portfolio && (
                      <a
                        href={devProfile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Matches */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Seus Matches</CardTitle>
              <CardDescription>
                Empresas que deram match com voce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchList matches={devProfile?.matches || []} />
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>
                Mantenha seu perfil atualizado para atrair mais empresas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={devProfile} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
