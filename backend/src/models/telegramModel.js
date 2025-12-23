// src/models/telegramModel.js
// Note: Telegram doesn't have its own collection in the database
// This model is for documentation purposes only

export const Telegram = {
  // Schema for tracking telegram interactions (if implemented in the future)
  schema: {
    userId: { type: String },
    username: { type: String },
    telegramUrl: { type: String, required: true },
    redirectedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }
  },

  // Collection for tracking redirects (if implemented in the future)
  collection: 'telegramRedirects',

  // Indexes for the collection (if implemented in the future)
  indexes: [
    { key: { userId: 1 } },
    { key: { redirectedAt: -1 } },
    { key: { ipAddress: 1 } }
  ],

  // Environment configuration
  config: {
    telegramGroupUrl: {
      type: 'string',
      env: 'TELEGRAM_GROUP_URL',
      default: 'https://t.me',
      description: 'Telegram group/channel invite URL'
    }
  }
};