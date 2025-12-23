//backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import borrowRoutes from './routes/borrows.js';
import commentRoutes from './routes/commentRoutes.js';
import newsRoutes from './routes/news.js';
import paymentRoutes from './routes/payments.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import profileRoutes from './routes/profiles.js';
import translationRoutes from './routes/translationRoutes.js';
import telegramRoutes from './routes/telegram.js';
import { connectDB } from './config/db.js';

// Import models
import { User } from './models/authModel.js';
import { Book } from './models/bookModel.js';
import { Borrow } from './models/borrowModel.js';
import { Comment } from './models/commentModel.js';
import { News } from './models/newsModel.js';
import { Profile } from './models/profileModel.js';
import { Report } from './models/reportModel.js';
import { Translation } from './models/translationModel.js';
import { Payment } from './models/paymentModel.js';
// import { Notification } from './models/notificationModel.js';
// import { BorrowRequest } from './models/borrowRequestModel.js';

dotenv.config();

// Connect to MongoDB
const db = await connectDB();

// Function to create indexes from models
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database from models...');
    
    // Array of all models
    const models = [
      User,
      Book,
      Borrow,
      // BorrowRequest,
      Comment,
      News,
      Profile,
      // Notification,
      Translation,
      Report,
      Payment
    ];
    
    // Create indexes for each model
    for (const model of models) {
      try {
        const collection = db.collection(model.collection);
        for (const index of model.indexes) {
          await collection.createIndex(index.key, index.options || {});
        }
        console.log(`✅ Indexes created for ${model.collection}`);
      } catch (error) {
        // Index might already exist, which is fine
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`⚠️ Indexes already exist for ${model.collection}`);
        } else if (error.code === 86) { // IndexKeySpecsConflict
          console.log(`⚠️ Index conflict for ${model.collection}, skipping...`);
        } else {
          console.log(`✅ Indexes created for ${model.collection}`);
        }
      }
    }
    
    // Initialize counters collection if needed
    const countersCollection = db.collection('counters');
    const userIdCounter = await countersCollection.findOne({ _id: 'userId' });
    if (!userIdCounter) {
      await countersCollection.insertOne({
        _id: 'userId',
        sequence_value: 1000
      });
      console.log('✅ Counters collection initialized');
    }
    
    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Initialize database
await initializeDatabase();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// INCREASED LIMIT TO 50MB to handle Chat History with Images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/telegram', telegramRoutes);

app.get('/', (req, res) => res.send('Library Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));