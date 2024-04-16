import express, { Request, Response, Router } from 'express';
const router: Router = express.Router();

import { register, login,verify } from '../controllers/auth';

router.post('/register', register);

router.post('/login', login);
router.get('/verify/:token',verify)

export default router;
