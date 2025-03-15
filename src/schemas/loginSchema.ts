import { z } from "zod";

const loginSchema = z.object({
    ci: z.string(),
    password: z.string().min(7).max(10)
})

export default loginSchema;