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