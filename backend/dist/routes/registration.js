"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registrationController_1 = require("../controllers/registrationController");
const router = (0, express_1.Router)();
// Route mapping for Udyam registrations submissions
router.post('/registrations', registrationController_1.createRegistration);
exports.default = router;
