import { z } from "zod";

export const anonymitySettingsSchema = z.object({
  anonymityMode: z.enum(["strict", "configurable"]),
  requireAggregationFloor: z.boolean(),
  aggregationFloor: z.coerce.number().min(3).max(20),
});

export type AnonymitySettingsInput = z.infer<typeof anonymitySettingsSchema>;
