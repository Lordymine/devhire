import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Users, Heart } from "lucide-react";
import { JobList } from "./job-list";
import { JobForm } from "./job-form";
import { MatchList } from "./match-list";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.type !== "COMPANY") {
    redirect("/profile");
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
      },
      matches: {
        include: {
          dev: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!companyProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Perfil nao encontrado</CardTitle>
            <CardDescription>
              Parece que seu perfil de empresa nao foi configurado corretamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeJobs = companyProfile.jobs.filter((job) => job.status === "active");
  const totalMatches = companyProfile.matches.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{companyProfile.name}</h1>
        <p className="text-muted-foreground">Dashboard da empresa</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              de {companyProfile.jobs.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Matches</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              desenvolvedores interessados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              perfis disponiveis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suas Vagas</CardTitle>
              <CardDescription>
                Gerencie as vagas da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobList jobs={companyProfile.jobs} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nova Vaga</CardTitle>
              <CardDescription>
                Publique uma nova oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobForm />
            </CardContent>
          </Card>
        </div>

        {/* Matches */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Matches Recentes</CardTitle>
              <CardDescription>
                Desenvolvedores interessados na sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchList matches={companyProfile.matches} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
