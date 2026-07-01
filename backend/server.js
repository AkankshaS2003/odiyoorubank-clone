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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/ragRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/service-applications', require('./routes/serviceApplicationRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/tpin', require('./routes/tpinRoutes'));
app.use('/api/admin/savings', require('./routes/adminSavingsRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/fd', require('./routes/fdRoutes'));
app.use('/api/admin/fd', require('./routes/adminFdRoutes'));
app.use('/api/rd', require('./routes/rdRoutes'));
app.use('/api/transfers', require('./routes/transferRoutes'));

// Initialize Cron Jobs
require('./cron/rdCron');
require('./cron/loanCron');

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
