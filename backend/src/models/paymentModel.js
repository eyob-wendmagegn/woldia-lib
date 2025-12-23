// src/models/paymentModel.js
export const Payment = {
  // Schema definition (for documentation and reference)
  schema: {
    // Payment information
    userId: { type: String, required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    borrowId: { type: String, required: true }, // Reference to borrow record
    
    // Payment method details
    method: { 
      type: String, 
      enum: ['chapa', 'telebirr', 'cash', 'bank'], 
      default: 'chapa' 
    },
    mobile: { type: String }, // For telebirr payments
    
    // Transaction references
    tx_ref: { type: String, required: true, unique: true }, // Unique transaction reference
    
    // Payment status
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'], 
      default: 'pending' 
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },

  // Indexes to be created in database
  indexes: [
    { key: { tx_ref: 1 }, options: { unique: true } },
    { key: { userId: 1 } },
    { key: { borrowId: 1 } },
    { key: { status: 1 } },
    { key: { method: 1 } },
    { key: { createdAt: -1 } },
    { key: { updatedAt: -1 } },
    // Compound indexes for common queries
    { key: { userId: 1, status: 1 } },
    { key: { status: 1, createdAt: -1 } },
    { key: { method: 1, status: 1 } }
  ],

  // Collection name in MongoDB
  collection: 'payments'
};