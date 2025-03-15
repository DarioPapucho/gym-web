import { z } from "zod";

const Client = z.object({
  name: z.string(),
  lastname: z.string(),
  username: z.string(),
  password: z.string(),
  phone: z.string(),
});

export default Client;

