import { z } from "zod";

const ClientSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  lastName: z.string(),
  username: z.string(),
  password: z.string(),
  phone: z.string(),
  streak: z.number(),
  membership: z.array(
    z.object({
      id: z.number(),
      amount: z.number(),
      discount: z.number(),
      days: z.number(),
      initDate: z.string(),
      finishDate: z.string(),
      clientId: z.number(),
      client: z.string(),
    })
  ),

  workoutPlanTemplateId: z.number(),
  workoutPlanTemplate: z.string(),
  lastWorkoutPlanAssignedDate: z.string(),
});

export default ClientSchema;

