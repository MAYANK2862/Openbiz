import { z } from 'zod';

// Step 1 validation (Aadhaar Verification)
export const step1Schema = z.object({
  aadhaar_number: z.string()
    .min(1, 'Aadhaar number is required')
    .regex(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'),
  owner_name: z.string()
    .min(1, 'Name of Entrepreneur is required')
    .regex(/^[A-Za-z ]{2,100}$/, 'Name must be 2-100 characters and contain only letters and spaces'),
  declaration: z.boolean().refine((val) => val === true, {
    message: 'You must consent to Aadhaar verification',
  }),
});

// Step 2 validation (PAN Verification with conditional logic)
export const step2Schema = z.object({
  type_of_organisation: z.string().min(1, 'Type of Organisation is required'),
  pan_number: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // '1' corresponds to Proprietary (Proprietorship)
  const isProprietorship = data.type_of_organisation === '1';

  // PAN is conditional: required for all except Proprietorship
  if (!isProprietorship) {
    if (!data.pan_number || data.pan_number.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pan_number'],
        message: 'PAN number is required for this organisation type',
      });
    }
  }

  // If PAN is provided, it must match the standard PAN format
  if (data.pan_number && data.pan_number.trim() !== '') {
    const panRegex = /^[A-Za-z]{4,5}[0-9]{4}[A-Za-z]{1}$/;
    if (!panRegex.test(data.pan_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pan_number'],
        message: 'PAN number must be 4-5 letters, 4 digits, 1 letter (e.g., LUFF2862Y)',
      });
    }
  }
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type FormData = Step1FormData & Step2FormData;
