import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-theme-lg backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
      <header className="flex flex-col items-center text-center">
        <div className="relative h-10 w-52">
          <Image
            src="/images/logo/auth-logo.svg"
            alt="Falcon"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-gray-900 dark:text-white">
          Crie sua conta
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Insira seus dados para começar a usar Falcon
        </p>
      </header>

      <RegisterForm />

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <span>Já tem uma conta? </span>
        <Link href="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Faça login
        </Link>
      </div>
    </div>
  );
}
