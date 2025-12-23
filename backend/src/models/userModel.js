// src/models/userModel.js
// User Model Definition for MongoDB

export const User = {
  // Collection name
  collection: 'users',

  // Schema definition for validation and documentation
  schema: {
    id: { 
      type: String, 
      required: true, 
      unique: true,
      description: 'Unique user identifier (provided by admin)'
    },
    name: { 
      type: String, 
      required: true,
      description: 'Full name of the user'
    },
    username: { 
      type: String, 
      unique: true, 
      sparse: true,
      description: 'Username for login (set by user during first login)'
    },
    email: { 
      type: String, 
      unique: true, 
      sparse: true,
      description: 'Email address for communication and password reset'
    },
    password: { 
      type: String,
      description: 'Hashed password'
    },
    role: { 
      type: String, 
      enum: ['admin', 'librarian', 'teacher', 'student'], 
      default: 'student',
      description: 'User role in the system'
    },
    department: { 
      type: String,
      description: 'Department/Class of the user'
    },
    status: { 
      type: String, 
      enum: ['active', 'deactive'], 
      default: 'active',
      description: 'Account status'
    },
    passwordChanged: { 
      type: Boolean, 
      default: false,
      description: 'Flag to track if user has changed their initial password'
    },
    isPasswordResetting: { 
      type: Boolean, 
      default: false,
      description: 'Flag for password reset process'
    },
    otp: { 
      type: String,
      description: 'One-time password for password reset'
    },
    otpExpires: { 
      type: Date,
      description: 'Expiry time for OTP'
    },
    deactivatedAt: { 
      type: Date,
      description: 'Timestamp when user was deactivated'
    },
    createdAt: { 
      type: Date, 
      default: Date.now,
      description: 'Account creation date'
    },
    updatedAt: { 
      type: Date, 
      default: Date.now,
      description: 'Last update timestamp'
    }
  },

  // Database indexes for performance
  indexes: [
    // Unique indexes
    { key: { id: 1 }, options: { unique: true } },
    { key: { username: 1 }, options: { unique: true, sparse: true } },
    { key: { email: 1 }, options: { unique: true, sparse: true } },
    
    // TTL index for OTP auto-cleanup (expires after 10 minutes)
    { key: { otpExpires: 1 }, options: { expireAfterSeconds: 0 } },
    
    // Query optimization indexes
    { key: { role: 1 } },
    { key: { status: 1 } },
    { key: { department: 1 } },
    { key: { createdAt: -1 } },
    { key: { updatedAt: -1 } },
    
    // Compound indexes for common queries
    { key: { role: 1, status: 1 } },
    { key: { status: 1, deactivatedAt: -1 } }
  ],

  // Validation rules for database operations
  validationRules: {
    bsonType: 'object',
    required: ['id', 'name', 'role'],
    properties: {
      id: {
        bsonType: 'string',
        description: 'must be a string and is required'
      },
      name: {
        bsonType: 'string',
        description: 'must be a string and is required'
      },
      role: {
        enum: ['admin', 'librarian', 'teacher', 'student'],
        description: 'must be one of the enum values and is required'
      }
    }
  },

  // Default values for new documents
  defaults: {
    status: 'active',
    passwordChanged: false,
    isPasswordResetting: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Helper methods (for reference, not actual Mongoose methods)
  methods: {
    isActive() {
      return this.status === 'active';
    },
    isAdmin() {
      return this.role === 'admin';
    },
    needsPasswordChange() {
      return !this.passwordChanged;
    },
    canLogin() {
      return this.status === 'active' && this.passwordChanged;
    }
  }
};

// Export for use in other files
export default User;