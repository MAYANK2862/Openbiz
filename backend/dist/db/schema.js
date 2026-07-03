"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.udyamSubmissions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.udyamSubmissions = (0, pg_core_1.pgTable)('udyam_submissions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    // Step 1: Aadhaar Verification
    aadhaarNumber: (0, pg_core_1.text)('aadhaar_number').notNull().unique(),
    ownerName: (0, pg_core_1.text)('owner_name').notNull(),
    declaration: (0, pg_core_1.boolean)('declaration').notNull(),
    // Step 2: PAN Verification
    typeOfOrganisation: (0, pg_core_1.text)('type_of_organisation').notNull(),
    panNumber: (0, pg_core_1.text)('pan_number'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    aadhaarUnique: (0, pg_core_1.unique)('aadhaar_unique').on(table.aadhaarNumber),
    aadhaarIndex: (0, pg_core_1.index)('aadhaar_idx').on(table.aadhaarNumber),
}));
