import { z } from "zod";

const loginSchema = z.object({
  ci: z.string(),
  password: z.string(),
});

export default loginSchema;
