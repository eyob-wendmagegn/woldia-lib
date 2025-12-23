// src/models/authModel.js
export const User = {
  // Schema definition (for documentation and reference)
  schema: {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'user', 'librarian'], default: 'user' },
    status: { type: String, enum: ['active', 'deactive'], default: 'active' },
    passwordChanged: { type: Boolean, default: false },
    isPasswordResetting: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },

  // Indexes to be created in database
  indexes: [
    { key: { id: 1 }, options: { unique: true } },
    { key: { username: 1 }, options: { unique: true, sparse: true } },
    { key: { email: 1 }, options: { unique: true, sparse: true } },
    { key: { otpExpires: 1 }, options: { expireAfterSeconds: 0 } },
    { key: { role: 1 } },
    { key: { status: 1 } }
  ],

  // Collection name in MongoDB
  collection: 'users'
};