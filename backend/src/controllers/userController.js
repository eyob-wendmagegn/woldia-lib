// src/controllers/userController.js
import { connectDB } from '../config/db.js';
import { hashPassword } from '../utils/hash.js';
import Joi from 'joi';

// ------------------------------------------------------------
// CREATE USER (admin only)
// ------------------------------------------------------------
const createSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(2).required(),
  username: Joi.string().min(3).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  role: Joi.string().valid('admin', 'librarian', 'teacher', 'student').required(),
  department: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'deactive').default('active'),
});

export const createUser = async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();

    // Check ID existence (Always required)
    const idExists = await db.collection('users').findOne({ id: value.id });
    if (idExists) return res.status(400).json({ message: 'ID already in use' });

    // Only check Username/Email uniqueness if they are provided
    if (value.username) {
      const usernameExists = await db.collection('users').findOne({ username: value.username });
      if (usernameExists) return res.status(400).json({ message: 'Username already taken' });
    }

    if (value.email) {
      const emailExists = await db.collection('users').findOne({ email: value.email });
      if (emailExists) return res.status(400).json({ message: 'Email already registered' });
    }

    const tempPwd = 'temp123';
    const hashed = await hashPassword(tempPwd);

    const doc = {
      ...value,
      username: value.username || '',
      email: value.email || '',
      password: hashed,
      passwordChanged: false,
      isPasswordResetting: false,
      otp: null,
      otpExpires: null,
      deactivatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').insertOne(doc);

    const user = await db.collection('users').findOne(
      { id: value.id },
      { projection: { password: 0, _id: 0, otp: 0, otpExpires: 0 } }
    );

    res.status(201).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// IMPORT USERS BULK
// ------------------------------------------------------------
const importSchema = Joi.object({
  users: Joi.array().items(createSchema).required()
});

export const importUsers = async (req, res) => {
  const { error, value } = importSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();
    const usersToImport = value.users;
    const errors = [];
    let importedCount = 0;

    // Prepare common password hash once
    const tempPwd = 'temp123';
    const hashed = await hashPassword(tempPwd);

    for (const userData of usersToImport) {
      try {
        // Build OR query based on what is provided
        const checks = [{ id: userData.id }];
        if (userData.username) checks.push({ username: userData.username });
        if (userData.email) checks.push({ email: userData.email });

        // Check for existing ID, Username, or Email
        const existing = await db.collection('users').findOne({ $or: checks });

        if (existing) {
          errors.push({ id: userData.id, message: `ID, Username, or Email already exists for user ${userData.id}.` });
          continue; // Skip this user
        }

        const doc = {
          ...userData,
          username: userData.username || '',
          email: userData.email || '',
          password: hashed,
          passwordChanged: false,
          isPasswordResetting: false,
          otp: null,
          otpExpires: null,
          deactivatedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('users').insertOne(doc);
        importedCount++;
      } catch (err) {
        console.error(`Error importing user ${userData.id}:`, err);
        errors.push({ id: userData.id, message: 'Database error' });
      }
    }

    res.status(201).json({
      message: 'Import process completed',
      importedCount,
      errors
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error during import' });
  }
};

// ------------------------------------------------------------
// GET CURRENT USER (ME) – FOR PROFILE
// ------------------------------------------------------------
export const getMe = async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne(
      { id: req.user.id },
      { projection: { password: 0, _id: 0, otp: 0, otpExpires: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// GET ALL USERS (admin)
// ------------------------------------------------------------
export const getUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;

    // Build query object
    const queryConditions = [];
    
    // Search across multiple fields
    if (search) {
      queryConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
        ],
      });
    }
    
    // Role filter
    if (role) {
      queryConditions.push({ role });
    }
    
    // Status filter
    if (status && status !== 'all') {
      queryConditions.push({ status });
    }

    // Combine conditions with $and if there are any
    const query = queryConditions.length > 0 ? { $and: queryConditions } : {};

    // Get paginated users
    const users = await db
      .collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .project({ password: 0, _id: 0, otp: 0, otpExpires: 0 })
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    res.json({ 
      users, 
      total, 
      page: +page, 
      limit: +limit,
      totalPages: Math.ceil(total / +limit)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// GET USER BY ID (admin)
// ------------------------------------------------------------
export const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne(
      { id },
      { projection: { password: 0, _id: 0, otp: 0, otpExpires: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// UPDATE USER – ADMIN CANNOT BE DEACTIVATED
// ------------------------------------------------------------
const updateSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(2).optional(),
  username: Joi.string().min(3).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  role: Joi.string().valid('admin', 'librarian', 'teacher', 'student').optional(),
  department: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'deactive').optional(),
});

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();

    const currentUser = await db.collection('users').findOne({ id });
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // BLOCK: Cannot change admin role
    if (currentUser.role === 'admin' && value.role && value.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot change admin role.' });
    }

    // BLOCK: Cannot deactivate admin
    if (currentUser.role === 'admin' && value.status === 'deactive') {
      return res.status(403).json({ message: 'Cannot deactivate admin account.' });
    }

    // Check ID uniqueness if changed
    if (value.id && value.id !== id) {
      const idExists = await db.collection('users').findOne({ id: value.id });
      if (idExists) return res.status(400).json({ message: 'ID already in use' });
    }

    // Username uniqueness
    if (value.username && value.username !== currentUser.username) {
      const exists = await db.collection('users').findOne({
        username: value.username,
        id: { $ne: id },
      });
      if (exists) return res.status(400).json({ message: 'Username already taken' });
    }

    // Email uniqueness
    if (value.email && value.email !== currentUser.email) {
      const exists = await db.collection('users').findOne({
        email: value.email,
        id: { $ne: id },
      });
      if (exists) return res.status(400).json({ message: 'Email already registered to another user' });
    }

    // Prepare update data
    const updateData = { ...value };
    
    // Always update timestamp
    updateData.updatedAt = new Date();
    
    // Track deactivation time when status changes to 'deactive'
    if (value.status === 'deactive' && currentUser.status !== 'deactive') {
      updateData.deactivatedAt = new Date();
    }
    
    // Clear deactivatedAt if reactivating
    if (value.status === 'active' && currentUser.status === 'deactive') {
      updateData.deactivatedAt = null;
    }

    // Perform update
    await db.collection('users').updateOne(
      { id },
      { $set: updateData }
    );

    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { id: value.id || id },
      { projection: { password: 0, _id: 0, otp: 0, otpExpires: 0 } }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found after update' });
    
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// DELETE USER (non-admin only)
// ------------------------------------------------------------
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ id });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin account.' });
    }

    await db.collection('users').deleteOne({ id });
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// RESET USER PASSWORD (admin only)
// ------------------------------------------------------------
export const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ id });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Reset password to temporary password
    const tempPwd = 'temp123';
    const hashed = await hashPassword(tempPwd);

    await db.collection('users').updateOne(
      { id },
      { 
        $set: { 
          password: hashed, 
          passwordChanged: false,
          isPasswordResetting: false,
          updatedAt: new Date()
        } 
      }
    );

    res.json({ 
      message: 'Password reset successfully',
      tempPassword: tempPwd // Only for admin reference, not for production
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};