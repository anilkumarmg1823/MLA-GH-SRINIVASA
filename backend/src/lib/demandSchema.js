import { z } from "zod";

export const DEMAND_APPROACHES = ["civil", "personal"];
export const DEMAND_STATUSES = [
  "Pending",
  "InProgress",
  "Completed",
  "Rejected",
];

export const demandCreateSchema = z.object({
  gramPanchayat: z.string().trim().min(1),
  village: z.string().trim().min(1),
  name: z.string().trim().min(1),
  approach: z.enum(["civil", "personal"]),
  subject: z.string().trim().min(1),
  status: z
    .enum(["Pending", "InProgress", "Completed", "Rejected"])
    .optional(),
});

export const demandUpdateSchema = demandCreateSchema.partial();

export function normalizeDemandBody(body) {
  const parsed = demandCreateSchema.parse(body);
  return {
    ...parsed,
    status: parsed.status || "Pending",
  };
}
