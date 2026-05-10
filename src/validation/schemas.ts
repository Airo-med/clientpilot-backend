import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const clientCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const projectCreateSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().max(10000).optional(),
  status: z.enum(["active", "completed"]).optional(),
  notes: z.string().max(10000).optional(),
  attachmentUrl: z.string().max(2048).optional(),
});

export const projectUpdateSchema = projectCreateSchema
  .omit({ clientId: true })
  .partial();

export const invoiceCreateSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.coerce.number().nonnegative().finite(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["paid", "unpaid"]).optional(),
});

export const invoiceUpdateSchema = z.object({
  amount: z.coerce.number().nonnegative().finite().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["paid", "unpaid"]).optional(),
  pdfUrl: z.string().max(2048).optional(),
});
