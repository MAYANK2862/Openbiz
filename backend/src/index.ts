import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import registrationRouter from './routes/registration';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Cross-Origin Resource Sharing (CORS) Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

// 2. Request Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Logger Middleware
app.use(morgan('dev'));

// 4. API Routes
app.use('/api', registrationRouter);

// 5. System Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'udyam-registration-api',
    time: new Date().toISOString() 
  });
});

// 6. Global Exception Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error handler]', err.stack || err);
  res.status(500).json({
    success: false,
    error: 'A server exception occurred while processing the request.'
  });
});

// 7. Start listener
app.listen(PORT, () => {
  console.log(`[API Server] Online and listening on port: ${PORT}`);
  console.log(`[API Server] Health endpoint: http://localhost:${PORT}/health`);
  console.log(`[API Server] Registration endpoint: http://localhost:${PORT}/api/registrations`);
});

export default app;
