# Web Scraper

This directory contains the web scraping scripts for extracting form fields from the Udyam registration portal.

## Files

- `webScrapping.js` - Main scraping script using axios + cheerio
- `scraped_fields_step1.json` - Raw scraper output for Aadhaar verification step
- `scraped_fields_step2.json` - Raw scraper output for PAN verification step

## Notes

### Manual Verification Required
The scraped field data should be manually verified against the actual Udyam registration form to ensure accuracy.

### OTP Gating Limitation
The Udyam portal uses OTP-based verification which cannot be automated through simple web scraping. The scraper can only extract the form field structure and validation rules, but cannot complete the actual submission process which requires:
- Aadhaar OTP verification
- PAN verification
- Mobile number OTP verification

### Usage

```bash
npm install
node webScrapping.js
```

This will generate the JSON files containing the scraped field definitions.
