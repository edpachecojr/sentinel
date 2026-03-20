import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, type Session } from "@/infra/lib/auth";
import { logger } from "@/infra/lib/logger";

type WhenAuthenticated = "next" | "redirect";

type PublicRoute = {
  path: string;
  whenAuthenticated: WhenAuthenticated;
};

const REDIRECT_WHEN_AUTHENTICATED_ROUTE = "/dashboard";
const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";
const ONBOARDING_ROUTE = "/onboarding";

const publicRoutes: PublicRoute[] = [
  { path: "/", whenAuthenticated: "next" },
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/api/auth", whenAuthenticated: "next" },
  { path: "/onboarding", whenAuthenticated: "next" },
];

const STATIC_ASSET_PATTERN =
  /\.(?:css|js|mjs|map|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|json|woff2?|ttf|eot)$/i;

function matchesRoute(pathname: string, routePath: string): boolean {
  if (routePath === "/") {
    return pathname === "/";
  }
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

function getPublicRoute(pathname: string): PublicRoute | undefined {
  return publicRoutes.find((route) => matchesRoute(pathname, route.path));
}

function isStaticAssetPath(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  return STATIC_ASSET_PATTERN.test(pathname);
}

function buildUnauthenticatedRedirect(request: NextRequest): NextResponse {
  const redirectUrl = new URL(
    REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE,
    request.url,
  );
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.searchParams.set("callbackUrl", callbackUrl || "/");
  return NextResponse.redirect(redirectUrl);
}

function buildAuthenticatedRedirect(request: NextRequest): NextResponse {
  const redirectUrl = new URL(REDIRECT_WHEN_AUTHENTICATED_ROUTE, request.url);
  return NextResponse.redirect(redirectUrl);
}

function buildOnboardingRedirect(request: NextRequest): NextResponse {
  const redirectUrl = new URL(ONBOARDING_ROUTE, request.url);
  return NextResponse.redirect(redirectUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isStaticAssetPath(pathname)) {
    return NextResponse.next();
  }

  const publicRoute = getPublicRoute(pathname);

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = Boolean(session?.user);

  if (!isAuthenticated && publicRoute) {
    logger.info("proxy:public", { path: pathname });
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    logger.info("proxy:unauthenticated-redirect", { path: pathname });
    return buildUnauthenticatedRedirect(request);
  }

  if (publicRoute?.whenAuthenticated === "redirect") {
    logger.info("proxy:authenticated-redirect", { path: pathname });
    return buildAuthenticatedRedirect(request);
  }

  // Onboarding guard: authenticated users who haven't completed onboarding
  // are redirected to /onboarding — EXCEPT when they are already on /onboarding
  if (!matchesRoute(pathname, ONBOARDING_ROUTE)) {
    const sessionTyped = session as Session | undefined;
    const user = sessionTyped?.user;
    if (user?.onboardingCompleted === false) {
      logger.info("proxy:onboarding-redirect", { path: pathname, userId: user.id });
      return buildOnboardingRedirect(request);
    }
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
