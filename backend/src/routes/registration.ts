import { Router } from 'express';
import { createRegistration, getRegistrations } from '../controllers/registrationController';

const router = Router();

// Route mapping for Udyam registrations submissions
router.post('/registrations', createRegistration);
router.get('/registrations', getRegistrations);

export default router;
