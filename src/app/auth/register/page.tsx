import Link from "next/link";
import { RegisterForm } from "./register-form";

interface RegisterPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const defaultType = params.type === "company" ? "company" : "dev";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            DevHire
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Criar sua conta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ja tem uma conta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </div>

        <RegisterForm defaultType={defaultType} />
      </div>
    </div>
  );
}
