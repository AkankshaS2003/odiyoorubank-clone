const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars FIRST before other imports
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/ragRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
