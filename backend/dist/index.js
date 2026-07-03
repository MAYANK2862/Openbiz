"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const registration_1 = __importDefault(require("./routes/registration"));
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// 3. Logger Middleware
app.use((0, morgan_1.default)('dev'));
// 4. API Routes
app.use('/api', registration_1.default);
// 5. System Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'udyam-registration-api',
        time: new Date().toISOString()
    });
});
// 6. Global Exception Error Handling Middleware
app.use((err, req, res, next) => {
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
exports.default = app;
