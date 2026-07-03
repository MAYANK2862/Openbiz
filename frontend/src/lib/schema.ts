import udyamSchema from '../../../schema/udyamSchema.json';

export type FieldType = 'text' | 'select' | 'checkbox';

export interface ConditionalRequirement {
  field: string;
  notEquals: string;
}

export interface FormField {
  id: string;
  sourceId: string;
  label: string;
  type: FieldType;
  maxLength?: number;
  required: boolean | 'conditional';
  requiredWhen?: ConditionalRequirement;
  validationRegex?: string;
  placeholder?: string;
  regexSource?: string;
  options?: string;
}

export interface SubmitButton {
  sourceId: string;
  label: string;
  mechanism?: string;
}

export interface UIFeedbackElement {
  sourceId: string;
  purpose: string;
}

export interface UIFeedbackElements {
  note?: string;
  elements: UIFeedbackElement[];
}

export interface FormStep {
  step: number;
  title: string;
  scrapedVia: string;
  fields: FormField[];
  submitButton?: SubmitButton;
  uiFeedbackElements?: UIFeedbackElements;
  notes?: string[];
}

export interface UdyamSchema {
  formTitle: string;
  sourceUrl: string;
  steps: FormStep[];
}

export const schema: UdyamSchema = udyamSchema as UdyamSchema;
