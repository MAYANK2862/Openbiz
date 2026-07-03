import { Request, Response } from 'express';
import { db } from '../db/client';
import { udyamSubmissions } from '../db/schema';
import { evaluateRegistrationPayload } from '../validation/rules';
import { eq } from 'drizzle-orm';

/**
 * Handles the creation of a new Udyam Registration record.
 * Validates payload constraints and enforces uniqueness of Aadhaar numbers.
 */
export async function createRegistration(req: Request, res: Response) {
  try {
    const payload = req.body;

    // Run field validations
    const validation = evaluateRegistrationPayload(payload);
    if (!validation.isValid) {
      console.log('[DEBUG API] Payload validation failed!', { payload, errors: validation.errors });
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Check for existing records with the same Aadhaar ID
    const duplicateList = await db
      .select()
      .from(udyamSubmissions)
      .where(eq(udyamSubmissions.aadhaarNumber, payload.aadhaar_number))
      .limit(1);

    if (duplicateList.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An application with this Aadhaar number has already been registered.'
      });
    }

    // Insert record into PostgreSQL database via Drizzle ORM
    const insertedRecords = await db
      .insert(udyamSubmissions)
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
  } catch (error) {
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
export async function getRegistrations(req: Request, res: Response) {
  try {
    const list = await db.select().from(udyamSubmissions);
    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('[Registration Controller] Fetch failed:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal database error occurred while retrieving submissions.'
    });
  }
}
