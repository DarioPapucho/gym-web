import { z } from "zod";

const MemberShipSchema = z.object({
  id: z.number(),
  amount: z.number(),
  discount: z.number(),
  days: z.number(),
  initDate: z.string(),
  finishDate: z.string(),
  clientId: z.number(),
  client: z.string(),
});

export default MemberShipSchema;

