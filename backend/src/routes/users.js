// src/routes/user.js
import express from 'express';
import {
  getMe,
  getUsers,
  getUserById,
  createUser,
  importUsers,
  updateUser,
  deleteUser,
  resetUserPassword
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (None - all require auth)
// ============================================

// ============================================
// PROTECTED ROUTES (require authentication)
// ============================================

// GET current user profile (for any authenticated user)
router.get('/me', protect, getMe);

// ============================================
// ADMIN ONLY ROUTES (require admin role)
// ============================================

// GET all users with pagination and search
router.get('/', protect, adminOnly, getUsers);

// GET specific user by ID
router.get('/:id', protect, adminOnly, getUserById);

// CREATE new user
router.post('/', protect, adminOnly, createUser);

// IMPORT multiple users
router.post('/import', protect, adminOnly, importUsers);

// UPDATE user by ID
router.put('/:id', protect, adminOnly, updateUser);

// DELETE user by ID (non-admin only)
router.delete('/:id', protect, adminOnly, deleteUser);

// RESET user password (admin only)
router.post('/:id/reset-password', protect, adminOnly, resetUserPassword);

export default router;