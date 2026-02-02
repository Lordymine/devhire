"use server";

import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export type LoginState = {
  error: string;
};

export async function loginWithCredentials(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email ou senha invalidos" };
        default:
          return { error: "Erro ao fazer login. Tente novamente." };
      }
    }
    throw error;
  }

  redirect("/discovery");
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/discovery" });
}
