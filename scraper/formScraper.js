/**
 * Udyam Registration Portal Form Scraper
 * Extracts input components, selects, textareas, and ASP.NET validators
 * from the registration page for schema validation mapping.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://udyamregistration.gov.in/UdyamRegistration.aspx';
const OUTPUT_FILE = path.join(__dirname, 'scraped_fields.json');

/**
 * Main scraper function
 */
async function runScraper() {
    console.log(`[Udyam Scraper] Fetching portal webpage from: ${TARGET_URL}...`);
    
    try {
        const response = await axios.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 10000
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const mainForm = $('form').first();

        if (mainForm.length === 0) {
            throw new Error('No form element found on the target page');
        }

        console.log('[Udyam Scraper] Main form element identified. Parsing inputs...');
        const extractedFields = [];

        // 1. Process all inputs, select boxes, and textareas
        mainForm.find('input, select, textarea').each((_, element) => {
            const $element = $(element);
            const elementId = $element.attr('id');

            // Exclude ASP.NET state fields (e.g. __VIEWSTATE, __EVENTVALIDATION)
            if (!elementId || elementId.startsWith('__')) {
                return;
            }

            extractedFields.push({
                tag: element.tagName,
                id: elementId,
                name: $element.attr('name') || null,
                type: $element.attr('type') || element.tagName,
                placeholder: $element.attr('placeholder') || null,
                maxlength: $element.attr('maxlength') || null,
                required: $element.attr('required') !== undefined,
                class: $element.attr('class') || null,
                labelText: null,
                validators: []
            });
        });

        console.log(`[Udyam Scraper] Found ${extractedFields.length} potential form controls. Mapping labels...`);

        // 2. Resolve label text for each extracted control
        extractedFields.forEach((field) => {
            const $fieldElement = mainForm.find(`#${field.id}`);

            // Method A: Check for explicit <label for="elementId">
            let labelText = mainForm.find(`label[for="${field.id}"]`).text().trim();

            // Method B fallback: Check inside the closest parent container (div, td, etc.)
            if (!labelText) {
                const parentContainer = $fieldElement.closest('div, td, li');
                if (parentContainer.length > 0) {
                    labelText = parentContainer.find('label').first().text().trim();
                }
            }

            // Remove excess spaces or newlines from label text
            field.labelText = labelText ? labelText.replace(/\s+/g, ' ') : null;
        });

        console.log('[Udyam Scraper] Parsing validator scripts and ASP.NET Validation spans...');

        // 3. Extract ASP.NET server/client validators and link to fields
        $('span[controltovalidate], span[id*="Validator"]').each((_, element) => {
            const $validator = $(element);
            const targetControlId = $validator.attr('controltovalidate');
            
            if (!targetControlId) {
                return;
            }

            const ruleDetails = {
                id: $validator.attr('id') || null,
                message: $validator.attr('errormessage') || $validator.text().trim() || null,
                expression: $validator.attr('validationexpression') || null,
                evaluator: $validator.attr('evaluationfunction') || null,
                type: $validator.attr('id')?.includes('Validator') ? 'ASP.NET Validator' : 'Custom Validator'
            };

            // Associate this validator rule with its targeted input field
            const matchingField = extractedFields.find(
                (field) => field.id === targetControlId || field.id.endsWith(targetControlId)
            );

            if (matchingField) {
                matchingField.validators.push(ruleDetails);
            }
        });

        // 4. Output the results
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extractedFields, null, 2), 'utf-8');
        console.log(`[Udyam Scraper] Completed! Extracted ${extractedFields.length} fields. Output written to: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('[Udyam Scraper] Scraping process failed:', error.message);
        process.exit(1);
    }
}

runScraper();
