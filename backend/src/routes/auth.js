// src/routes/auth.js
import express from 'express';
import { 
  firstLogin, 
  changePassword, 
  login,
  changePasswordAfterLogin,
  forgotPassword, 
  verifyOtp,
  changeUsername
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/first-login', firstLogin);                    // username + ID
router.post('/change-password', changePassword);            // first-time OR reset password
router.post('/login', login);                               // normal login

// Forgot Password & OTP
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);

// Protected routes (require authentication)
router.post('/change-password-after-login', protect, changePasswordAfterLogin);
router.post('/change-username', protect, changeUsername);

export default router;