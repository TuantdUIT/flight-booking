import { z } from "zod";

export const auditFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"]).optional(),
  entityType: z.enum(["booking", "flight", "user", "airline", "passenger"]).optional(),
  entityId: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(50),
  offset: z.number().int().min(0).default(0),
});

export type AuditFiltersSchema = z.infer<typeof auditFiltersSchema>;
