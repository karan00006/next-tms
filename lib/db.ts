import mysql from "mysql2/promise";

let cachedPool: mysql.Pool | null = null;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  return databaseUrl;
}

export const pool = new Proxy({} as mysql.Pool, {
  get(_, prop) {
    if (!cachedPool) {
      cachedPool = mysql.createPool(getDatabaseUrl());
    }
    const value = (cachedPool as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(cachedPool);
    }
    return value;
  },
});

export type DbUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  is_admin: number;
  otp: string | null;
  attemtps: number | null;
  expiry: string | null;
};

export type DbNote = {
  ID: number;
  task: string;
  description: string;
  status: string;
  created_at: string;
  user_id: number;
  admin_message: string | null;
};

export type DbAdminNote = DbNote & {
  user_name: string | null;
};
