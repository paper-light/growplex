import { z } from "zod";

export const LeadsSchema = z.object({
  email: z.email().nullable().describe("Email address of the lead"),
  phone: z.string().nullable().describe("Phone number of the lead"),
  name: z.string().nullable().describe("Name of the lead"),
  description: z.string().nullable().describe("Description of the lead"),

  metadata: z.object({
    company: z.string().nullable().describe("Company name"),
    website: z.string().nullable().describe("Website URL"),
    position: z.string().nullable().describe("Job position or title"),
    location: z.string().nullable().describe("Location or address"),
    industry: z.string().nullable().describe("Industry or sector"),
    notes: z.string().nullable().describe("Additional notes about the lead"),
  }),
});

export const LeadsResponseSchema = z.object({
  leads: z.array(LeadsSchema).describe("List of leads"),
});
