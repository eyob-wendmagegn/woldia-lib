// src/models/profileModel.js
export const Profile = {
  // Schema definition (for documentation and reference)
  schema: {
    // User reference
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    
    // Profile image
    profileImage: { 
      type: String, 
      maxlength: 4500000 // ~4.5MB for base64 (3MB actual image)
    },
    defaultInitial: { type: String, required: true },
    hasCustomImage: { type: Boolean, default: false },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },

  // Indexes to be created in database
  indexes: [
    { key: { userId: 1 }, options: { unique: true } },
    { key: { username: 1 } },
    { key: { hasCustomImage: 1 } },
    { key: { createdAt: -1 } },
    { key: { updatedAt: -1 } },
    // Compound indexes for common queries
    { key: { userId: 1, hasCustomImage: 1 } }
  ],

  // Collection name in MongoDB
  collection: 'profiles'
};