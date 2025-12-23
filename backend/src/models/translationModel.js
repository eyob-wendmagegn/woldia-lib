// src/models/translationModel.js
export const Translation = {
  // Schema definition (for documentation and reference)
  schema: {
    lang: { 
      type: String, 
      required: true, 
      unique: true,
      enum: ['en', 'am', 'or', 'ti', 'so'] // English, Amharic, Oromo, Tigrinya, Somali
    },
    data: { 
      type: Object, 
      required: true 
    },
    lastUpdated: { type: Date, default: Date.now },
    version: { type: String, default: '1.0.0' },
    isActive: { type: Boolean, default: true }
  },

  // Indexes to be created in database
  indexes: [
    { key: { lang: 1 }, options: { unique: true } },
    { key: { isActive: 1 } },
    { key: { lastUpdated: -1 } }
  ],

  // Collection name in MongoDB
  collection: 'translations'
};