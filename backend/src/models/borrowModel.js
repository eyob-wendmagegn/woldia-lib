// src/models/borrowModel.js
export const Borrow = {
  // Schema definition (for documentation and reference)
  schema: {
    // User information
    userId: { type: String, required: true },
    username: { type: String, required: true },
    userType: { type: String, enum: ['student', 'teacher', 'librarian', 'admin'], default: 'student' },
    
    // Book information
    bookId: { type: String, required: true },
    bookName: { type: String, required: true },
    bookTitle: { type: String },
    
    // Borrow details
    requestedAt: { type: Date },
    borrowedAt: { type: Date },
    dueDate: { type: Date, required: true },
    returnedAt: { type: Date },
    
    // Status and approval
    status: { 
      type: String, 
      enum: ['pending', 'borrowed', 'returned', 'rejected', 'overdue'], 
      default: 'pending' 
    },
    fine: { type: Number, default: 0 },
    
    // Approval information
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    requestedBy: { type: String }, // Who made the request
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },

  // Indexes to be created in database
  indexes: [
    { key: { userId: 1 } },
    { key: { username: 1 } },
    { key: { bookId: 1 } },
    { key: { status: 1 } },
    { key: { requestedAt: -1 } },
    { key: { borrowedAt: -1 } },
    { key: { dueDate: 1 } },
    { key: { returnedAt: -1 } },
    { key: { approvedBy: 1 } },
    // Compound indexes for common queries
    { key: { userId: 1, status: 1 } },
    { key: { bookId: 1, status: 1 } },
    { key: { status: 1, returnedAt: 1 } }
  ],

  // Collection name in MongoDB
  collection: 'borrows'
};