"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createJob, type JobFormState } from "./actions";

export function JobForm() {
  const [state, formAction, isPending] = useActionState<JobFormState, FormData>(
    createJob,
    { success: false, error: "" }
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titulo da vaga *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ex: Senior Full Stack Developer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descricao *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descreva a vaga, responsabilidades e beneficios..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills necessarias (separadas por virgula)</Label>
        <Textarea
          id="skills"
          name="skills"
          placeholder="React, Node.js, TypeScript, PostgreSQL"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">
          Requisitos (separados por virgula)
        </Label>
        <Textarea
          id="requirements"
          name="requirements"
          placeholder="5+ anos de experiencia, Ingles avancado, Experiencia com equipes ageis"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de contrato *</Label>
          <Select name="type" required>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localizacao</Label>
          <Input
            id="location"
            name="location"
            placeholder="Ex: Sao Paulo, SP"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remote"
          name="remote"
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="remote" className="text-sm font-normal">
          Aceita trabalho remoto
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Salario minimo (R$)</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            placeholder="8000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMax">Salario maximo (R$)</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            placeholder="15000"
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Vaga criada com sucesso!</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando..." : "Criar Vaga"}
      </Button>
    </form>
  );
}
