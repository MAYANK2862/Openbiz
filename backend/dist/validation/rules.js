"use strict";
/**
 * Registration Payload Validation Utility
 * Validates Udyam submission requests on the backend server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateRegistrationPayload = evaluateRegistrationPayload;
// Regex validation expressions matching portal requirements
const FIELD_PATTERNS = {
    aadhaar: {
        regex: /^[0-9]{12}$/,
        error: 'Aadhaar number must be exactly 12 numerical digits.'
    },
    entrepreneurName: {
        regex: /^[A-Za-z ]{2,100}$/,
        error: 'Entrepreneur name must be between 2 and 100 letters (spaces allowed).'
    },
    pan: {
        regex: /^[A-Za-z]{4,5}[0-9]{4}[A-Za-z]{1}$/,
        error: 'PAN card format must be: 4-5 letters, 4 digits, 1 letter (e.g., LUFF2862Y).'
    }
};
/**
 * Validates registration payloads submitted via the API.
 * Handles conditional PAN requirements (exempt for Proprietorship: organisation type '1').
 */
function evaluateRegistrationPayload(data) {
    const errors = {};
    // 1. Aadhaar Number Validation
    if (!data.aadhaar_number) {
        errors.aadhaar_number = 'Aadhaar number is required.';
    }
    else if (!FIELD_PATTERNS.aadhaar.regex.test(data.aadhaar_number)) {
        errors.aadhaar_number = FIELD_PATTERNS.aadhaar.error;
    }
    // 2. Entrepreneur Name Validation
    if (!data.owner_name) {
        errors.owner_name = 'Name of Entrepreneur is required.';
    }
    else if (!FIELD_PATTERNS.entrepreneurName.regex.test(data.owner_name)) {
        errors.owner_name = FIELD_PATTERNS.entrepreneurName.error;
    }
    // 3. Declaration Consent Check
    if (data.declaration !== true) {
        errors.declaration = 'You must agree to the Aadhaar verification consent.';
    }
    // 4. Organisation Type Validation
    if (!data.type_of_organisation) {
        errors.type_of_organisation = 'Type of organisation is required.';
    }
    // 5. Conditional PAN Validation
    const isProprietor = data.type_of_organisation === '1';
    if (!isProprietor) {
        // Required for non-proprietorship organisation types
        if (!data.pan_number || data.pan_number.trim() === '') {
            errors.pan_number = 'PAN number is required for the selected organisation type.';
        }
        else if (!FIELD_PATTERNS.pan.regex.test(data.pan_number)) {
            errors.pan_number = FIELD_PATTERNS.pan.error;
        }
    }
    else if (data.pan_number && data.pan_number.trim() !== '') {
        // If PAN is provided for proprietor, it must still match correct format
        if (!FIELD_PATTERNS.pan.regex.test(data.pan_number)) {
            errors.pan_number = FIELD_PATTERNS.pan.error;
        }
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
