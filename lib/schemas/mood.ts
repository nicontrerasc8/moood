import { z } from "zod";

export const moodCheckinSchema = z.object({
  score: z.number().min(1).max(5),
  labels: z.array(z.string()).max(3).default([]),
  note: z.string().max(240).optional(),
  anonymous: z.boolean().default(false),
  requestMeeting: z.boolean().default(false),
});

export type MoodCheckinFormValues = z.input<typeof moodCheckinSchema>;
export type MoodCheckinInput = z.infer<typeof moodCheckinSchema>;
