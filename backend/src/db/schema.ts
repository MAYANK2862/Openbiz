import { pgTable, serial, text, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';

export const udyamSubmissions = pgTable('udyam_submissions', {
  id: serial('id').primaryKey(),
  
  // Step 1: Aadhaar Verification
  aadhaarNumber: text('aadhaar_number').notNull().unique(),
  ownerName: text('owner_name').notNull(),
  declaration: boolean('declaration').notNull(),
  
  // Step 2: PAN Verification
  typeOfOrganisation: text('type_of_organisation').notNull(),
  panNumber: text('pan_number'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  aadhaarUnique: unique('aadhaar_unique').on(table.aadhaarNumber),
  aadhaarIndex: index('aadhaar_idx').on(table.aadhaarNumber),
}));

export type UdyamSubmission = typeof udyamSubmissions.$inferSelect;
export type NewUdyamSubmission = typeof udyamSubmissions.$inferInsert;
