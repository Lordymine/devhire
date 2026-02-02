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
import { updateDevProfile, type ProfileState } from "./actions";

interface DevProfile {
  title: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  portfolio: string | null;
  github: string | null;
  linkedin: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
}

interface ProfileFormProps {
  profile: DevProfile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateDevProfile,
    { success: false, error: "" }
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Titulo profissional</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex: Full Stack Developer"
            defaultValue={profile?.title || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localizacao</Label>
          <Input
            id="location"
            name="location"
            placeholder="Ex: Sao Paulo, SP"
            defaultValue={profile?.location || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Sobre voce</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Conte um pouco sobre sua experiencia e objetivos..."
          rows={4}
          defaultValue={profile?.bio || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (separadas por virgula)</Label>
        <Textarea
          id="skills"
          name="skills"
          placeholder="React, Node.js, TypeScript, PostgreSQL"
          defaultValue={profile?.skills?.join(", ") || ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experience">Anos de experiencia</Label>
          <Select name="experience" defaultValue={profile?.experience || ""}>
            <SelectTrigger id="experience">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Pretensao minima (R$)</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            placeholder="5000"
            defaultValue={profile?.salaryMin || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMax">Pretensao maxima (R$)</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            placeholder="15000"
            defaultValue={profile?.salaryMax || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio">Portfolio URL</Label>
        <Input
          id="portfolio"
          name="portfolio"
          type="url"
          placeholder="https://seuportfolio.com"
          defaultValue={profile?.portfolio || ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            name="github"
            type="url"
            placeholder="https://github.com/seuusuario"
            defaultValue={profile?.github || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/seuusuario"
            defaultValue={profile?.linkedin || ""}
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Perfil atualizado com sucesso!</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar alteracoes"}
      </Button>
    </form>
  );
}
