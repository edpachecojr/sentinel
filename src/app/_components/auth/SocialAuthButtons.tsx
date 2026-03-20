"use client";

import Button from "@/components/ui/button/Button";
import { authClient } from "@/infra/lib/auth-client";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
    >
      <path
        d="M21.35 11.1h-9.3v2.8h5.3c-.25 1.4-1.4 4.1-5.3 4.1-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3.1.8 3.8 1.6l2.6-2.5C17.2 3 15.1 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.7 0 9.5-4 9.5-9.7 0-.6-.1-1-.15-1.2z"
        fill="#4285F4"
      />
      <path
        d="M3.1 7.8l3 2.2C7 8.2 9.4 7 12 7c1.7 0 3.1.6 4 1.4l3-3C17.4 3.4 14.9 2 12 2 8.2 2 4.9 3.9 3.1 7.8z"
        fill="#34A853"
      />
      <path
        d="M12 22c2.9 0 5.3-1 7.1-2.7l-3.3-2.7c-.9.6-2.1 1-3.8 1-3.3 0-5.9-2.1-6.9-5.1l-3 2.3C4 19 7.8 22 12 22z"
        fill="#FBBC05"
      />
      <path
        d="M21.35 11.1h-9.3v2.8h5.3c-.2 1.2-1 2.2-2.1 2.9l3.3 2.7c1.9-1.7 3-4.2 3-7.4 0-.6-.1-1-.15-1.2z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface SocialAuthButtonsProps {
  isPending: boolean;
}

export function SocialAuthButtons({ isPending }: SocialAuthButtonsProps) {
  const handleSocialRegister = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-3 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            ou continuar com
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isPending}
          startIcon={<GoogleIcon />}
          onClick={handleSocialRegister}
        >
          Continuar com Google
        </Button>
      </div>
    </>
  );
}
