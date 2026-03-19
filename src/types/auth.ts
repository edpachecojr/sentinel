import type { Session as BetterAuthSession } from "@/infrastructure/lib/auth";

export type AppSession = BetterAuthSession;
export type AppUser = Exclude<AppSession, null>["user"];
