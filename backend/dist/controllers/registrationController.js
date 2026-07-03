"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegistration = createRegistration;
exports.getRegistrations = getRegistrations;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const rules_1 = require("../validation/rules");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Handles the creation of a new Udyam Registration record.
 * Validates payload constraints and enforces uniqueness of Aadhaar numbers.
 */
async function createRegistration(req, res) {
    try {
        const payload = req.body;
        // Run field validations
        const validation = (0, rules_1.evaluateRegistrationPayload)(payload);
        if (!validation.isValid) {
            console.log('[DEBUG API] Payload validation failed!', { payload, errors: validation.errors });
            return res.status(400).json({
                success: false,
                errors: validation.errors
            });
        }
        // Check for existing records with the same Aadhaar ID
        const duplicateList = await client_1.db
            .select()
            .from(schema_1.udyamSubmissions)
            .where((0, drizzle_orm_1.eq)(schema_1.udyamSubmissions.aadhaarNumber, payload.aadhaar_number))
            .limit(1);
        if (duplicateList.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'An application with this Aadhaar number has already been registered.'
            });
        }
        // Insert record into PostgreSQL database via Drizzle ORM
        const insertedRecords = await client_1.db
            .insert(schema_1.udyamSubmissions)
            .values({
            aadhaarNumber: payload.aadhaar_number,
            ownerName: payload.owner_name,
            declaration: payload.declaration,
            typeOfOrganisation: payload.type_of_organisation,
            panNumber: payload.pan_number || null
        })
            .returning();
        return res.status(201).json({
            success: true,
            message: 'Registration submission processed successfully.',
            data: insertedRecords[0]
        });
    }
    catch (error) {
        console.error('[Registration Controller] Insertion failed:', error);
        return res.status(500).json({
            success: false,
            error: 'An internal database error occurred while registering the entrepreneur.'
        });
    }
}
/**
 * Retrieves all registered submissions from the database.
 */
async function getRegistrations(req, res) {
    try {
        const list = await client_1.db.select().from(schema_1.udyamSubmissions);
        return res.status(200).json({
            success: true,
            data: list
        });
    }
    catch (error) {
        console.error('[Registration Controller] Fetch failed:', error);
        return res.status(500).json({
            success: false,
            error: 'An internal database error occurred while retrieving submissions.'
        });
    }
}
