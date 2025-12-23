// src/models/commentModel.js
export const Comment = {
  // Schema definition (for documentation and reference)
  schema: {
    id: { type: String, required: true, unique: true }, // Format: C-YYYYMMDD-UUID
    userId: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user', 'librarian'], default: 'user' },
    comment: { type: String, required: true },
    readByAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },

  // Indexes to be created in database
  indexes: [
    { key: { id: 1 }, options: { unique: true } },
    { key: { userId: 1 } },
    { key: { username: 1 } },
    { key: { readByAdmin: 1 } },
    { key: { createdAt: -1 } },
    { key: { role: 1 } },
    // Text search index for comment content
    { key: { comment: 'text' } },
    // Compound indexes for common queries
    { key: { userId: 1, createdAt: -1 } },
    { key: { readByAdmin: 1, createdAt: -1 } }
  ],

  // Collection name in MongoDB
  collection: 'comments'
};