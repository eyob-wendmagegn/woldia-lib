// src/models/newsModel.js
export const News = {
  // Schema definition (for documentation and reference)
  schema: {
    id: { type: String, required: true, unique: true }, // Format: N-YYYYMMDD-UUID
    role: { 
      type: [String], 
      enum: ['librarian', 'teacher', 'student', 'admin'],
      default: ['librarian', 'teacher', 'student'] 
    },
    news: { type: String, required: true, minlength: 5 },
    readBy: [{ type: String }], // Array of user IDs who have read the news
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },

  // Indexes to be created in database
  indexes: [
    { key: { id: 1 }, options: { unique: true } },
    { key: { role: 1 } },
    { key: { readBy: 1 } },
    { key: { createdAt: -1 } },
    // Compound indexes for common queries
    { key: { role: 1, createdAt: -1 } },
    { key: { readBy: 1, createdAt: -1 } },
    // Text search index for news content
    { key: { news: 'text' } }
  ],

  // Collection name in MongoDB
  collection: 'news'
};