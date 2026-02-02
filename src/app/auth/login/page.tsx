import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            DevHire
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Entrar na sua conta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nao tem uma conta?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
