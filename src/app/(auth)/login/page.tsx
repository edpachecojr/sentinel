import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-theme-lg backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
      <header className="flex flex-col items-center text-center">
        <div className="relative h-10 w-52">
          <Image
            src="/images/logo/auth-logo.svg"
            alt="MeuCargueiro"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-gray-900 dark:text-white">
          Boas-vindas de volta
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Entre com suas credenciais para acessar sua conta
        </p>
      </header>

      <LoginForm />

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <span>Não tem uma conta? </span>
        <Link href="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
