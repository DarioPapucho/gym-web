import z from "zod";

const TrainerSchema = z.object({
  id: z.number(),
  birthDate: z.string(),
  gender: z.number(),
  monthPoints: z.number(),
  employee: z.string(),
});

export default TrainerSchema;

