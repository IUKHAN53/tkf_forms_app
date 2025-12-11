import { z } from 'zod';

export const formSubmissionSchema = z.object({
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  data: z.record(z.string(), z.any()),
});

export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;
