import { z } from "zod";

export const trialFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  industry: z.string().min(1, "Please select an industry")
});

export type TrialFormData = z.infer<typeof trialFormSchema>;
