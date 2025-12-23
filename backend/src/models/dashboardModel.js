// src/models/dashboardModel.js
// Note: Dashboard doesn't have its own collection, but we define analytics schemas for reference

export const Dashboard = {
  // This model is for reference only - dashboard doesn't have its own collection
  // It aggregates data from multiple collections
  
  // Schema for dashboard statistics (for documentation)
  statistics: {
    // Admin stats
    admin: {
      totals: {
        users: { type: Number },
        activeUsers: { type: Number },
        deactiveUsers: { type: Number },
        books: { type: Number },
        posts: { type: Number },
        reports: { type: Number }
      },
      charts: {
        userGrowth: {
          labels: [{ type: String }],
          data: [{ type: Number }]
        },
        postActivity: {
          labels: [{ type: String }],
          data: [{ type: Number }]
        }
      },
      recentUsers: [{
        name: { type: String },
        username: { type: String },
        createdAt: { type: Date }
      }]
    },
    
    // Librarian stats
    librarian: {
      totals: {
        books: { type: Number },
        borrowed: { type: Number },
        returned: { type: Number },
        paid: { type: Number }
      },
      pie: {
        borrowed: { type: Number },
        available: { type: Number }
      },
      returns: {
        labels: [{ type: String }],
        data: [{ type: Number }]
      },
      added: {
        labels: [{ type: String }],
        data: [{ type: Number }]
      },
      borrowedTrend: {
        labels: [{ type: String }],
        data: [{ type: Number }]
      },
      recentActivity: [{
        action: { type: String },
        user: { type: String },
        book: { type: String },
        date: { type: String },
        fine: { type: Number }
      }]
    },
    
    // Teacher stats
    teacher: {
      totals: {
        addedBooks: { type: Number },
        borrowedBooks: { type: Number },
        returnedBooks: { type: Number }
      },
      charts: {
        booksAdded: {
          labels: [{ type: String }],
          data: [{ type: Number }]
        },
        borrowedTrend: {
          labels: [{ type: String }],
          data: [{ type: Number }]
        }
      },
      recentActivity: [{
        action: { type: String },
        book: { type: String },
        date: { type: String },
        type: { type: String }
      }]
    },
    
    // Student stats
    student: {
      totalBorrowed: { type: Number },
      totalViews: { type: Number },
      booksToReturn: { type: Number },
      readingProgress: { type: Number },
      currentBooks: [{
        bookId: { type: String },
        bookTitle: { type: String },
        dueDate: { type: String },
        borrowedAt: { type: String },
        fine: { type: Number }
      }],
      history: [{
        bookTitle: { type: String },
        borrowedAt: { type: String },
        returnedAt: { type: String },
        fine: { type: Number },
        status: { type: String }
      }]
    }
  },
  
  // Collection references used in dashboard
  collections: ['users', 'books', 'borrows', 'news', 'reports', 'comments'],
  
  // Aggregation periods used
  periods: {
    last7Days: { days: 7 },
    last4Weeks: { weeks: 4 },
    last6Weeks: { weeks: 6 }
  }
};