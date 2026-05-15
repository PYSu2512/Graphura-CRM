/**
 * GRAPHURA CRM — PRODUCTION SERVER
 * Multi-tenant SaaS CRM built with Express, MongoDB, Mongoose
 * Comprehensive registration, authentication, and tenant management
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const AppError = require('./utils/appError');
const logger = require('./utils/logger');

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const authController = require('./controllers/auth.controller');
const bulkUserUploadRoutes = require('./routes/bulkUserUpload');
const userRoutes = require('./routes/users');
const superAdminRoutes = require('./routes/superadmin');
const teamRoutes = require('./routes/teams');
const announcementRoutes = require('./routes/announcements');
const salesManagerLeadRoutes = require('./routes/salesManagerLeads');
const salesTeamLeaderLeadRoutes      = require('./routes/salesTeamLeaderLeads');
const salesTeamLeaderDashboardRoutes = require('./routes/salesTeamLeaderDashboard');
const salesTeamLeaderReportRoutes    = require('./routes/salesTeamLeaderReports');
const salesManagerDashboardRoutes    = require('./routes/salesManagerDashboard');
const attendanceRoutes = require('./routes/attendance');
const salesExecutiveLeadRoutes = require('./routes/salesExecutiveLeads');
const salesExecutiveProspectRoutes = require('./routes/salesExecutiveProspects');
const salesExecutiveFollowUpRoutes = require('./routes/salesExecutiveFollowUps');
const salesExecutiveDashboardRoutes = require('./routes/salesExecutiveDashboard');
const ticketRoutes = require('./routes/tickets');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ────────────────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '16kb' })); // Parse JSON payloads
app.use(express.urlencoded({ limit: '16kb', extended: true })); // Parse URL-encoded
app.use(morgan('dev')); // HTTP request logging

// ────────────────────────────────────────────────────────────
// HEALTH CHECK ENDPOINT
// ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
	res.status(200).json({
		message: 'Graphura CRM API',
		version: '1.0.0',
		status: 'Server is running',
	});
});

// Logout shortcut for browsers: GET /logout
app.get('/logout', authController.logout);

// ────────────────────────────────────────────────────────────
// API ROUTES
// ────────────────────────────────────────────────────────────
console.log('📍 Registering API routes...');
try {
  app.use('/api/auth', authRoutes);
  console.log('✓ /api/auth routes registered');
  app.use('/api/users/bulk', bulkUserUploadRoutes);
  console.log('✓ /api/users/bulk routes registered');
  app.use('/api/users', userRoutes);
  console.log('✓ /api/users routes registered');
  app.use('/api/superadmin', superAdminRoutes);
  console.log('✓ /api/superadmin routes registered');
  app.use('/api/teams', teamRoutes);
  console.log('✓ /api/teams routes registered');
	app.use('/api/announcements', announcementRoutes);
	console.log('✓ /api/announcements routes registered');
  app.use('/api/sales-manager/leads', salesManagerLeadRoutes);
  console.log('✓ /api/sales-manager/leads routes registered');
  app.use('/api/sales-team-leader/leads', salesTeamLeaderLeadRoutes);
  console.log('✓ /api/sales-team-leader/leads routes registered');
  app.use('/api/sales-team-leader/dashboard', salesTeamLeaderDashboardRoutes);
  console.log('✓ /api/sales-team-leader/dashboard routes registered');
  app.use('/api/sales-team-leader/reports', salesTeamLeaderReportRoutes);
  console.log('✓ /api/sales-team-leader/reports routes registered');
  app.use('/api/sales-manager/dashboard', salesManagerDashboardRoutes);
  console.log('✓ /api/sales-manager/dashboard routes registered');
  app.use('/api/attendance', attendanceRoutes);
  console.log('✓ /api/attendance registered');
	app.use('/api/sales-executive/leads', salesExecutiveLeadRoutes);
	console.log('✓ /api/sales-executive/leads routes registered');
	app.use('/api/sales-executive/prospects', salesExecutiveProspectRoutes);
	console.log('✓ /api/sales-executive/prospects routes registered');
	app.use('/api/sales-executive/follow-ups', salesExecutiveFollowUpRoutes);
	console.log('✓ /api/sales-executive/follow-ups routes registered');
	app.use('/api/sales-executive/dashboard', salesExecutiveDashboardRoutes);
	console.log('✓ /api/sales-executive/dashboard routes registered');
  app.use('/api/support-tickets', ticketRoutes);
  console.log('✓ /api/support-tickets routes registered');
} catch (error) {
  console.error('❌ Error registering routes:', error);
}

// ────────────────────────────────────────────────────────────
// 404 HANDLER (Express 5 safe)
// ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER MIDDLEWARE
// ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
	err.statusCode = err.statusCode || 500;
	err.message = err.message || 'Internal Server Error';

	// Wrong MongoDB ID error
	if (err.name === 'CastError') {
		const message = `Resource not found: ${err.path}`;
		return res.status(400).json({
			success: false,
			message,
		});
	}

	// Mongoose duplicate key error
	if (err.code === 11000) {
		const field = Object.keys(err.keyPattern)[0];
		const message = `${field} must be unique`;
		return res.status(409).json({
			success: false,
			message,
		});
	}

	// JWT errors
	if (err.name === 'JsonWebTokenError') {
		return res.status(401).json({
			success: false,
			message: 'Invalid token',
		});
	}

	if (err.name === 'TokenExpiredError') {
		return res.status(401).json({
			success: false,
			message: 'Token expired',
		});
	}

	// Default error response
	res.status(err.statusCode).json({
		success: false,
		message: err.message,
		...(NODE_ENV === 'development' && { stack: err.stack }),
	});
});

// ────────────────────────────────────────────────────────────
// START SERVER
// ────────────────────────────────────────────────────────────
const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			logger.info(`✅ Server running on port ${PORT} (${NODE_ENV} mode)`);
		});
	} catch (error) {
		logger.error('Failed to start server', error.message);
		process.exit(1);
	}
};

startServer();
