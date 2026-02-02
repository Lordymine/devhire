"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface FiltersProps {
  currentSkills: string[];
  currentLocation: string;
  currentSalaryMin?: number;
  currentSalaryMax?: number;
}

export function Filters({
  currentSkills,
  currentLocation,
  currentSalaryMin,
  currentSalaryMax,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [skills, setSkills] = useState(currentSkills.join(", "));
  const [location, setLocation] = useState(currentLocation);
  const [salaryMin, setSalaryMin] = useState(currentSalaryMin?.toString() || "");
  const [salaryMax, setSalaryMax] = useState(currentSalaryMax?.toString() || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (skills) {
      params.set("skills", skills.split(",").map((s) => s.trim()).join(","));
    } else {
      params.delete("skills");
    }

    if (location) {
      params.set("location", location);
    } else {
      params.delete("location");
    }

    if (salaryMin) {
      params.set("salaryMin", salaryMin);
    } else {
      params.delete("salaryMin");
    }

    if (salaryMax) {
      params.set("salaryMax", salaryMax);
    } else {
      params.delete("salaryMax");
    }

    router.push(`/discovery?${params.toString()}`);
  };

  const handleClear = () => {
    setSkills("");
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("skills");
    params.delete("location");
    params.delete("salaryMin");
    params.delete("salaryMax");

    router.push(`/discovery?${params.toString()}`);
  };

  const hasFilters = currentSkills.length > 0 || currentLocation || currentSalaryMin || currentSalaryMax;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="React, Node.js, TypeScript"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localizacao</Label>
              <Input
                id="location"
                placeholder="Sao Paulo"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salario minimo (R$)</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="5000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salario maximo (R$)</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="20000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Filtrar
            </Button>
            {hasFilters && (
              <Button type="button" variant="outline" onClick={handleClear} className="gap-2">
                <X className="h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
