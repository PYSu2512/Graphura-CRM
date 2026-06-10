/**
 * GRAPHURA CRM — PRODUCTION SERVER
 * Multi-tenant SaaS CRM built with Express, MongoDB, Mongoose
 * Comprehensive registration, authentication, and tenant management
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
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
const salesTeamLeaderLeadRoutes = require('./routes/salesTeamLeaderLeads');
const salesTeamLeaderDashboardRoutes = require('./routes/salesTeamLeaderDashboard');
const salesTeamLeaderReportRoutes = require('./routes/salesTeamLeaderReports');
const salesManagerDashboardRoutes = require('./routes/salesManagerDashboard');
const salesManagerReportRoutes = require('./routes/salesManagerReports');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const salesExecutiveLeadRoutes = require('./routes/salesExecutiveLeads');
const salesExecutiveProspectRoutes = require('./routes/salesExecutiveProspects');
const financeProspectRoutes = require('./routes/financeProspects');
const financePaymentRoutes = require('./routes/financePayments');
const invoiceRoutes = require('./routes/invoices');
const workOrderRoutes = require('./routes/workOrders');
const managementWorkOrderRoutes = require('./routes/managementWorkOrders');
const managementTeamRoutes      = require('./routes/managementTeams');
const managementTLRoutes        = require('./routes/managementTL');
const managementEmployeeRoutes  = require('./routes/managementEmployee');
const publicTrackingRoutes      = require('./routes/publicTracking');
const managementProjectRoutes   = require('./routes/projects');
const managementRoutes          = require('./routes/management');
const paymentWebhookRoutes = require('./routes/paymentWebhooks');
const paymentSuccessRoutes = require('./routes/paymentSuccess');
const salesExecutiveFollowUpRoutes = require('./routes/salesExecutiveFollowUps');
const salesExecutiveDashboardRoutes = require('./routes/salesExecutiveDashboard');
const ticketRoutes = require('./routes/tickets');
const notificationRoutes = require('./routes/notifications');
const logsRoutes = require('./routes/logs');
const adminRoutes = require('./routes/admin');
const apiConfigRoutes = require('./routes/apiConfig');
const financeRoutes = require('./routes/finance');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ────────────────────────────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors({
	origin: (origin, callback) => {
		const allowed = [
			'http://localhost:5173',
			'http://localhost:5174',
			'http://localhost:5175',
			process.env.FRONTEND_URL,
			process.env.BACKEND_PUBLIC_URL,
			process.env.NGROK_URL,
		].filter(Boolean);

		// Allow requests with no origin (mobile apps, curl, Razorpay webhooks)
		if (!origin || allowed.some((u) => origin.startsWith(u))) {
			return callback(null, true);
		}
		// Allow any ngrok domain
		if (/\.ngrok(-free)?\.app$/.test(origin) || /\.ngrok\.io$/.test(origin)) {
			return callback(null, true);
		}
		callback(new Error(`CORS: origin ${origin} not allowed`));
	},
	credentials: true,
}));

// Razorpay webhooks need exact raw bytes before any JSON parsing happens.
// Mount the webhook route first with a raw body parser so signature verification
// uses the original request payload bytes.
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '64kb' }));

// Middleware to capture raw body for webhook verification
app.use('/api/payments/webhook', (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    // Store both req.body (Buffer) and req.rawBody (string) for flexibility
    req.rawBody = req.body;
  }
  next();
});

app.use('/api/payments/webhook', paymentWebhookRoutes);

// Capture raw body for the rest of the app as well.
app.use(express.json({ limit: '64kb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ limit: '64kb', extended: true, verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(morgan('dev')); // HTTP request logging
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
	app.use('/api/sales-manager/reports', salesManagerReportRoutes);
	console.log('✓ /api/sales-manager/reports routes registered');
	app.use('/api/sales-manager/reports', salesManagerReportRoutes);
	console.log('✓ /api/sales-manager/reports routes registered');
	app.use('/api/attendance', attendanceRoutes);
	console.log('✓ /api/attendance registered');
	app.use('/api/leaves', leaveRoutes);
	console.log('✓ /api/leaves registered');
	app.use('/api/sales-executive/leads', salesExecutiveLeadRoutes);
	console.log('✓ /api/sales-executive/leads routes registered');
	app.use('/api/sales-executive/prospects', salesExecutiveProspectRoutes);
	console.log('✓ /api/sales-executive/prospects routes registered');
	app.use('/api/finance/prospects', financeProspectRoutes);
	console.log('✓ /api/finance/prospects routes registered');
	app.use('/api/finance/payments', financePaymentRoutes);
	console.log('✓ /api/finance/payments routes registered');
	app.use('/api/finance/invoices', invoiceRoutes);
	console.log('✓ /api/finance/invoices routes registered');
	app.use('/api/finance/work-orders', workOrderRoutes);
	console.log('✓ /api/finance/work-orders routes registered');
	app.use('/api/management/work-orders', managementWorkOrderRoutes);
	console.log('✓ /api/management/work-orders routes registered');
	app.use('/api/management/teams', managementTeamRoutes);
	console.log('✓ /api/management/teams routes registered');
	app.use('/api/management-tl', managementTLRoutes);
	console.log('✓ /api/management-tl routes registered');
	app.use('/api/management-employee', managementEmployeeRoutes);
	console.log('✓ /api/management-employee routes registered');
	app.use('/api/public', publicTrackingRoutes);
	console.log('✓ /api/public routes registered');
	app.use('/api/management/projects', managementProjectRoutes);
	console.log('✓ /api/management/projects routes registered');
	app.use('/api/management', managementRoutes);
	console.log('✓ /api/management (dashboard + clients) routes registered');
	app.use('/api/payments', paymentSuccessRoutes);
	console.log('✓ /api/payments success routes registered');
	console.log('✓ /api/payments/webhook routes registered');
	app.use('/api/sales-executive/follow-ups', salesExecutiveFollowUpRoutes);
	console.log('✓ /api/sales-executive/follow-ups routes registered');
	app.use('/api/sales-executive/dashboard', salesExecutiveDashboardRoutes);
	console.log('✓ /api/sales-executive/dashboard routes registered');
	app.use('/api/support-tickets', ticketRoutes);
	console.log('✓ /api/support-tickets routes registered');
	app.use('/api/notifications', notificationRoutes);
	console.log('✓ /api/notifications routes registered');
	app.use('/api/logs', logsRoutes);
	console.log('✓ /api/logs routes registered');
	app.use('/api/api-config', apiConfigRoutes);
	console.log('✓ /api/api-config routes registered');
  app.use('/api/admin', adminRoutes);
  console.log('✓ /api/admin routes registered');
	app.use('/api/finance', financeRoutes);
	console.log('✓ /api/finance routes registered');
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
// START SERVER (only when run directly)
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

// Export app for testing/imports
module.exports = app;

if (require.main === module) {
	startServer();
}
