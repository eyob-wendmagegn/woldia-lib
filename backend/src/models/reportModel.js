// src/models/reportModel.js
import { connectDB } from '../config/db.js';

export const Report = {
  // Schema definition (for documentation and reference)
  // Note: Reports are generated on-demand, not stored in a collection
  // This is the structure of generated reports
  schema: {
    type: { 
      type: String, 
      enum: ['users', 'news', 'books', 'deactive', 'system', 'financial'], 
      required: true 
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly', 'custom'],
      default: 'weekly'
    },
    data: { type: Object, required: true },
    generatedAt: { type: Date, default: Date.now },
    generatedBy: { type: String },
    parameters: { type: Object } // Additional parameters like date range
  },

  // Collection for storing generated reports (if you want to save them)
  collection: 'savedReports',

  // Indexes for saved reports collection
  indexes: [
    { key: { type: 1 } },
    { key: { period: 1 } },
    { key: { generatedAt: -1 } },
    { key: { generatedBy: 1 } },
    // Compound indexes
    { key: { type: 1, generatedAt: -1 } },
    { key: { period: 1, generatedAt: -1 } }
  ]
};

// Your existing function for generating weekly reports
export const getWeeklyReport = async (type) => {
  const db = await connectDB();

  // ---- 1 week ago (00:00) -------------------------------------------------
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  // ---- Base filter ---------------------------------------------------------
  const filter = { createdAt: { $gte: weekAgo } };

  // ---- 1. Users ------------------------------------------------------------
  if (type === 'users') {
    const added = await db.collection('users')
      .find({ ...filter, role: { $ne: 'admin' } })
      .project({ password: 0, _id: 0 })
      .toArray();

    const deactivated = await db.collection('users')
      .find({ ...filter, status: 'deactive', role: { $ne: 'admin' } })
      .project({ password: 0, _id: 0 })
      .toArray();

    return { added, deactivated };
  }

  // ---- 2. News -------------------------------------------------------------
  if (type === 'news') {
    const added = await db.collection('news')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return { added };
  }

  // ---- 3. Books ------------------------------------------------------------
  if (type === 'books') {
    const added = await db.collection('books')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return { added };
  }

  // ---- 4. Deactive users (FIXED: Show users DEACTIVATED this week) -------------
  if (type === 'deactive') {
    // FIX: Get all deactivated users and filter by when they were deactivated
    // First, try to find by deactivatedAt field
    let deactivated = await db.collection('users')
      .find({ 
        status: 'deactive',
        role: { $ne: 'admin' }
      })
      .project({ password: 0, _id: 0 })
      .toArray();

    // Filter in JavaScript to show only users deactivated this week
    const recentDeactivated = deactivated.filter(user => {
      // Check if user has deactivatedAt field and it's within this week
      if (user.deactivatedAt && new Date(user.deactivatedAt) >= weekAgo) {
        return true;
      }
      
      // Check if user has updatedAt field and it's within this week (status change)
      if (user.updatedAt && new Date(user.updatedAt) >= weekAgo) {
        return true;
      }
      
      // Fallback: User was created this week AND is deactivated
      if (user.createdAt && new Date(user.createdAt) >= weekAgo) {
        return true;
      }
      
      return false;
    });

    return { deactivated: recentDeactivated };
  }

  throw new Error('Invalid report type');
};