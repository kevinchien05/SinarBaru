import express from "express";
import user_controller from '../controllers/user.js';

const router = express.Router();

router.get('/', user_controller.login);
router.post('/login', user_controller.auth);
router.get('/logout', user_controller.logout);

export default router;