import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevList } from "./dev-list";
import { CompanyList } from "./company-list";
import { JobList } from "./job-list";
import { Filters } from "./filters";

interface DiscoveryPageProps {
  searchParams: Promise<{
    tab?: string;
    skills?: string;
    location?: string;
    salaryMin?: string;
    salaryMax?: string;
  }>;
}

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userType = session?.user?.type;

  const defaultTab = userType === "COMPANY" ? "devs" : "companies";
  const currentTab = params.tab || defaultTab;

  // Parse filters
  const skills = params.skills?.split(",").filter(Boolean) || [];
  const location = params.location || "";
  const salaryMin = params.salaryMin ? parseInt(params.salaryMin, 10) : undefined;
  const salaryMax = params.salaryMax ? parseInt(params.salaryMax, 10) : undefined;

  // Fetch devs
  const devs = await prisma.devProfile.findMany({
    where: {
      AND: [
        skills.length > 0 ? { skills: { hasSome: skills } } : {},
        location ? { location: { contains: location, mode: "insensitive" } } : {},
        salaryMin ? { salaryMax: { gte: salaryMin } } : {},
        salaryMax ? { salaryMin: { lte: salaryMax } } : {},
      ],
    },
    include: { user: true },
    take: 20,
    orderBy: { updatedAt: "desc" },
  });

  // Fetch companies with jobs count
  const companies = await prisma.companyProfile.findMany({
    where: location
      ? { location: { contains: location, mode: "insensitive" } }
      : {},
    include: {
      user: true,
      _count: { select: { jobs: { where: { status: "active" } } } },
    },
    take: 20,
    orderBy: { updatedAt: "desc" },
  });

  // Fetch active jobs
  const jobs = await prisma.job.findMany({
    where: {
      status: "active",
      AND: [
        skills.length > 0 ? { skills: { hasSome: skills } } : {},
        location ? { location: { contains: location, mode: "insensitive" } } : {},
        salaryMin ? { salaryMax: { gte: salaryMin } } : {},
        salaryMax ? { salaryMin: { lte: salaryMax } } : {},
      ],
    },
    include: { company: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Descobrir</h1>
        <p className="text-muted-foreground">
          Encontre desenvolvedores, empresas e vagas
        </p>
      </div>

      <Filters
        currentSkills={skills}
        currentLocation={location}
        currentSalaryMin={salaryMin}
        currentSalaryMax={salaryMax}
      />

      <Tabs defaultValue={currentTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="devs">Desenvolvedores</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="jobs">Vagas</TabsTrigger>
        </TabsList>

        <TabsContent value="devs" className="mt-6">
          <DevList devs={devs} canLike={userType === "COMPANY"} />
        </TabsContent>

        <TabsContent value="companies" className="mt-6">
          <CompanyList companies={companies} canLike={userType === "DEV"} />
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobList jobs={jobs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
