"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerDev, registerCompany, type RegisterState } from "./actions";

interface RegisterFormProps {
  defaultType: "dev" | "company";
}

export function RegisterForm({ defaultType }: RegisterFormProps) {
  const [userType, setUserType] = useState<"dev" | "company">(defaultType);

  const [devState, devFormAction, isDevPending] = useActionState<RegisterState, FormData>(
    registerDev,
    { error: "" }
  );
  const [companyState, companyFormAction, isCompanyPending] = useActionState<RegisterState, FormData>(
    registerCompany,
    { error: "" }
  );

  return (
    <Tabs
      defaultValue={defaultType}
      onValueChange={(v) => setUserType(v as "dev" | "company")}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="dev">Sou Dev</TabsTrigger>
        <TabsTrigger value="company">Sou Empresa</TabsTrigger>
      </TabsList>

      <TabsContent value="dev">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Desenvolvedor</CardTitle>
            <CardDescription>
              Crie seu perfil e encontre as melhores oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={devFormAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dev-name">Nome completo *</Label>
                <Input
                  id="dev-name"
                  name="name"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-email">Email *</Label>
                <Input
                  id="dev-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-password">Senha *</Label>
                <Input
                  id="dev-password"
                  name="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-title">Titulo profissional</Label>
                <Input
                  id="dev-title"
                  name="title"
                  placeholder="Ex: Full Stack Developer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-skills">Skills (separadas por virgula)</Label>
                <Textarea
                  id="dev-skills"
                  name="skills"
                  placeholder="React, Node.js, TypeScript, PostgreSQL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dev-experience">Anos de experiencia</Label>
                <Select name="experience">
                  <SelectTrigger id="dev-experience">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 anos</SelectItem>
                    <SelectItem value="1-3">1-3 anos</SelectItem>
                    <SelectItem value="3-5">3-5 anos</SelectItem>
                    <SelectItem value="5-10">5-10 anos</SelectItem>
                    <SelectItem value="10+">10+ anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {devState?.error && (
                <p className="text-sm text-destructive">{devState.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isDevPending}>
                {isDevPending ? "Criando conta..." : "Criar conta de Dev"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Empresa</CardTitle>
            <CardDescription>
              Cadastre sua empresa e encontre os melhores talentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={companyFormAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Seu nome *</Label>
                <Input
                  id="company-name"
                  name="name"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-email">Email corporativo *</Label>
                <Input
                  id="company-email"
                  name="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-password">Senha *</Label>
                <Input
                  id="company-password"
                  name="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-company-name">Nome da empresa *</Label>
                <Input
                  id="company-company-name"
                  name="companyName"
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  name="website"
                  type="url"
                  placeholder="https://suaempresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-size">Tamanho da empresa</Label>
                <Select name="size">
                  <SelectTrigger id="company-size">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-10)</SelectItem>
                    <SelectItem value="small">Pequena (11-50)</SelectItem>
                    <SelectItem value="medium">Media (51-200)</SelectItem>
                    <SelectItem value="large">Grande (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {companyState?.error && (
                <p className="text-sm text-destructive">{companyState.error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isCompanyPending}
              >
                {isCompanyPending ? "Criando conta..." : "Criar conta de Empresa"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
