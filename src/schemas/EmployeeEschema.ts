import { z } from "zod";

export const EmployeeUpdateSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  password: z.string(),
  ci: z.string(),
  phone: z.string(),
  salary: z.number(),
  lastPayment: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  workInDays: z.number(),
  ocupation: z.number(),
});

export type EmployeeUpdate = z.infer<typeof EmployeeUpdateSchema>;

