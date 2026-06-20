import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import type { SessionRole, SessionResult } from "./types";

const COOKIE_NAMES: Record<SessionRole, string> = {
  admin: "admin_session",
  gate: "gate_session",
};

const MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const secret = process.env.NEXT_PUBLIC_SESSION_SECRET;
  if (!secret) throw new Error("NEXT_PUBLIC_SESSION_SECRET environment variable is required");
  return secret;
}

function sign(role: SessionRole, timestamp: number): string {
  const payload = `${role}:${timestamp}`;
  const hmac = createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

export async function createSession(role: SessionRole): Promise<void> {
  const timestamp = Date.now();
  const signature = sign(role, timestamp);
  const token = `${timestamp}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES[role], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function verifySession(): Promise<SessionResult> {
  const cookieStore = await cookies();

  for (const role of ["admin", "gate"] as SessionRole[]) {
    const token = cookieStore.get(COOKIE_NAMES[role])?.value;
    if (!token) continue;

    const dotIndex = token.indexOf(".");
    if (dotIndex === -1) continue;

    const timestampStr = token.slice(0, dotIndex);
    const providedSig = token.slice(dotIndex + 1);

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) continue;

    const age = (Date.now() - timestamp) / 1000;
    if (age > MAX_AGE) continue;

    const expectedSig = sign(role, timestamp);
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) continue;

    if (timingSafeEqual(a, b)) {
      return { authenticated: true, role };
    }
  }

  return { authenticated: false };
}

export async function deleteSession(role: SessionRole): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES[role]);
}
