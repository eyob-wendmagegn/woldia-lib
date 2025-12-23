// src/models/bookModel.js
export const Book = {
  // Schema definition (for documentation and reference only)
  schema: {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    publisher: { type: String, required: true },
    isbn: { type: String, required: true },
    copies: { type: Number, min: 0, required: true },
    addedBy: { type: String },
    createdAt: { type: Date, default: Date.now }
  },

  // Indexes to be created in database
  indexes: [
    { key: { id: 1 }, options: { unique: true } },
    { key: { title: 1 } },
    { key: { name: 1 } },
    { key: { category: 1 } },
    { key: { createdAt: -1 } }
  ],

  // Collection name in MongoDB
  collection: 'books'
};