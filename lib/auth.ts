import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "auth_token";
export const RESET_COOKIE = "reset_token";

const encoder = new TextEncoder();

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set.");
  }
  return encoder.encode(secret);
}

export type AuthPayload = {
  userId: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type ResetPayload = {
  email: string;
};

async function signToken(payload: Record<string, unknown>, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function createAuthToken(payload: AuthPayload) {
  return signToken(payload, "7d");
}

export async function createResetToken(payload: ResetPayload) {
  return signToken(payload, "10m");
}

async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as T;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyToken<AuthPayload>(token);
}

export async function getResetPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(RESET_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifyToken<ResetPayload>(token);
}
