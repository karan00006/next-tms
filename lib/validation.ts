import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
  adminCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().trim().regex(/^\d{4,6}$/),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createNoteSchema = z.object({
  task: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  status: z.string().trim().min(1).max(50),
});

export const updateNoteSchema = createNoteSchema;

export const addCommentSchema = z.object({
  id: z.number().int().positive(),
  message: z.string().trim().min(1).max(500),
});

export const toggleRoleSchema = z.object({
  targetUserId: z.number().int().positive(),
});

export const deleteUserSchema = z.object({
  targetUserId: z.number().int().positive(),
});
