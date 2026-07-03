# Udyam Form 

A multi-stage web application for Udyam registration form handling, including web scraping, frontend form submission, and backend API with database persistence.

## Project Flow

```
udyam-form-assignment/
│
├── scraper/                          # Stage 1: Web Scraping
│   ├── formScraper.js                # axios + cheerio script (refactored)
│   ├── scraped_fields_step1.json     # raw scraper output, Aadhaar
│   ├── scraped_fields_step2.json     # raw scraper output, PAN
│   └── README.md                     # notes on manual verification, OTP gating limitation
│
├── schema/                           # Single source of truth, consumed by BOTH frontend + backend
│   └── udyamSchema.json
│
├── frontend/                         # Stage 2: Vite React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── UdyamRegistrationWizard.tsx # dynamic step controller & review UI
│   │   │   ├── UdyamInputField.tsx         # generic field renderer (switch on type)
│   │   │   └── FlowProgressBar.tsx         # modern dynamic step progress tracker
│   │   ├── lib/
│   │   │   ├── schema.ts                   # imports udyamSchema.json, typed
│   │   │   └── validation.ts               # zod validation with conditional rules
│   │   ├── main.tsx                        # entry point
│   │   └── index.css                       # styles and animations
│   ├── public/
│   └── package.json
│
├── backend/                          # Stage 3: API + DB
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts             # Drizzle schema (mirrors udyamSchema.json, udyam_submissions table)
│   │   │   └── client.ts
│   │   ├── controllers/
│   │   │   └── registrationController.ts # handles creation & database checks
│   │   ├── routes/
│   │   │   └── registration.ts       # POST /api/registrations
│   │   ├── validation/
│   │   │   └── rules.ts              # validation logic mapping frontend patterns
│   │   └── index.ts                  # server setup with preflight CORS headers
│   └── package.json
│
└── README.md                         # overall project writeup
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Openbiz Assignment
   ```

2. **Install dependencies**
   ```bash
   # Install scraper dependencies
   cd scraper
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Database Setup**
   - Create a database named `udyam_db`
   - Update the `DATABASE_URL` in backend `.env` file

4. **Run Database Migrations**
   ```bash
   cd backend
   npm run db:push  # or npm run db:migrate
   ```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Scraping Limitations

The web scraper (`scraper/formScraper.js`) has the following limitations:

1. **OTP Gating**: The Udyam portal requires OTP verification for:
   - Aadhaar authentication
   - PAN verification
   - Mobile number verification
   
   These cannot be automated through simple web scraping and require manual intervention.

2. **Dynamic Content**: Some form fields may be loaded dynamically via JavaScript, which may not be captured by the initial HTML scraping.

3. **Manual Verification**: The scraped field definitions should be manually verified against the actual Udyam registration form to ensure accuracy.

## Development Notes

- **Schema-Driven Architecture**: The `schema/udyamSchema.json` file is the single source of truth for form definitions, consumed by both frontend and backend.
- **Validation**: Both frontend and backend use the same validation rules derived from the schema to ensure consistency.
- **Type Safety**: TypeScript is used throughout the project for type safety.

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests (if configured)
cd frontend
npm test
```

## License

This project is part of an assignment for Openbiz.
