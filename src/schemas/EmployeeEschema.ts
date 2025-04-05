import { z } from "zod";

// Schema for employee update - making fields optional for partial updates
export const EmployeeUpdateSchema = z.object({
  name: z.string().optional(),
  lastname: z.string().optional(),
  password: z.string().optional(), // Password is optional during updates
  ci: z.string().optional(),
  phone: z.string().optional(),
  salary: z.union([z.number(), z.string()])
    .optional()
    .transform(val => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    }),
  lastPayment: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return undefined; // Return undefined if not provided
  }, z.date().optional()), // Make lastPayment optional
  workInDays: z.union([z.number(), z.string()])
    .optional()
    .transform(val => {
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    }),
  ocupation: z.union([z.number(), z.string()]).optional()
    .transform(val => {
      // Convert string to number if it's a number in string form
      if (typeof val === 'string') {
        const parsed = parseInt(val);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    }),
});

export type EmployeeUpdate = z.infer<typeof EmployeeUpdateSchema>;