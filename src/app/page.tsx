import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, MessageCircle, Briefcase, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              DevHire
            </h1>
            <p className="mt-4 text-xl text-primary/80 font-medium">
              Conectando Devs e Empresas
            </p>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Encontre o match perfeito para sua carreira ou sua empresa.
              Uma plataforma onde desenvolvedores e empresas se conectam
              de forma simples e eficiente.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/register?type=dev">
                  Sou Dev
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/auth/register?type=company">
                  Sou Empresa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Ja tem uma conta?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Como Funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Simples, rapido e eficiente
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Match</CardTitle>
              <CardDescription>
                Devs e empresas se conectam atraves de curtidas mutuas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navegue por perfis de empresas ou desenvolvedores e demonstre
                interesse. Quando ambos se curtem, e um match!
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Chat</CardTitle>
              <CardDescription>
                Converse diretamente apos o match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Apos o match, inicie uma conversa para conhecer melhor
                a oportunidade ou o candidato. Tudo dentro da plataforma.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Vagas</CardTitle>
              <CardDescription>
                Empresas publicam vagas, devs se candidatam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Empresas criam vagas detalhadas com requisitos e beneficios.
                Devs filtram por skills, salario e tipo de contrato.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para comecar?
            </h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Junte-se a milhares de desenvolvedores e empresas que ja
              encontraram o match perfeito.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/register">Criar conta gratis</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/discovery">Explorar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              2024 DevHire. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Termos
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacidade
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contato
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
