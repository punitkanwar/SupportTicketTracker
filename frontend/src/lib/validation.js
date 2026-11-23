import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(120, 'Subject cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Technical', 'Billing', 'Account', 'General', 'Other'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    errorMap: () => ({ message: 'Please select a priority' }),
  }),
});
