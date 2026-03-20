import type { Session as BetterAuthSession } from "@/infra/lib/auth";

export type AppSession = BetterAuthSession;
export type AppUser = Exclude<AppSession, null>["user"];
