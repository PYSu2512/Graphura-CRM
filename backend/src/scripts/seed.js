const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const {
  CompanySettings,
  Department,
  Role,
  User,
  RefreshToken,
  LoginLog,
  Team,
  Client,
  Lead,
  LeadActivity,
  Reminder,
  ProspectForm,
  BulkLeadUpload,
  SalesTarget,
  Project,
  ProjectUpdate,
  Payment,
  WorkOrder,
  Invoice,
  Expense,
  Ticket,
  Attendance,
  Leave,
  Announcement,
  Notification,
  ApiConfig,
  Subscription,
} = require('../models/index');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env');
  process.exit(1);
}

/**
 * Production-level database initialization script
 * - Creates collections and indexes
 * - No sample data seeding
 * - Suitable for production deployments
 */
const initializeDatabase = async () => {
  const startTime = Date.now();

  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 DATABASE INITIALIZATION - PRODUCTION MODE');
    console.log('='.repeat(70));
    console.log(`⏱️  Started at: ${new Date().toISOString()}`);
    console.log(`📍 Target: ${MONGODB_URI.replace(/:[^:]*@/, ':***@')}\n`);

    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB successfully!\n');

    // Get database reference
    const db = mongoose.connection.db;

    // List of all models to initialize
    const modelsToInit = [
      { name: 'CompanySettings', model: CompanySettings },
      { name: 'Department', model: Department },
      { name: 'Role', model: Role },
      { name: 'User', model: User },
      { name: 'RefreshToken', model: RefreshToken },
      { name: 'LoginLog', model: LoginLog },
      { name: 'Team', model: Team },
      { name: 'Client', model: Client },
      { name: 'Lead', model: Lead },
      { name: 'LeadActivity', model: LeadActivity },
      { name: 'Reminder', model: Reminder },
      { name: 'ProspectForm', model: ProspectForm },
      { name: 'BulkLeadUpload', model: BulkLeadUpload },
      { name: 'SalesTarget', model: SalesTarget },
      { name: 'Project', model: Project },
      { name: 'ProjectUpdate', model: ProjectUpdate },
      { name: 'Payment', model: Payment },
      { name: 'WorkOrder', model: WorkOrder },
      { name: 'Invoice', model: Invoice },
      { name: 'Expense', model: Expense },
      { name: 'Ticket', model: Ticket },
      { name: 'Attendance', model: Attendance },
      { name: 'Leave', model: Leave },
      { name: 'Announcement', model: Announcement },
      { name: 'Notification', model: Notification },
      { name: 'ApiConfig', model: ApiConfig },
      { name: 'Subscription', model: Subscription },
    ];

    console.log('📋 Initializing Collections & Indexes...\n');

    // Initialize each collection
    for (const { name, model } of modelsToInit) {
      try {
        // Create collection if it doesn't exist
        const collectionExists = await db.listCollections({ name: model.collection.name }).toArray();
        
        if (collectionExists.length === 0) {
          await db.createCollection(model.collection.name);
          console.log(`  ✓ Collection created: ${name}`);
        } else {
          console.log(`  ✓ Collection exists: ${name}`);
        }

        // Create indexes defined in schema
        await model.collection.dropAllIndexes().catch(() => {}); // Safe drop
        await model.syncIndexes();
        const indexCount = Object.keys(model.collection.getIndexes() || {}).length;
        
        if (indexCount > 1) {
          console.log(`    └─ ${indexCount - 1} indexes created`); // -1 for default _id index
        }
      } catch (error) {
        console.error(`  ❌ Error initializing ${name}:`, error.message);
        throw error;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE INITIALIZATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));

    // Summary statistics
    const collectionCount = modelsToInit.length;
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Verify connection one more time
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`✅ MongoDB Server Status: ${serverStatus.ok === 1 ? 'HEALTHY' : 'UNHEALTHY'}`);
    console.log(`✅ Uptime: ${(serverStatus.uptime / 3600).toFixed(2)} hours\n`);

    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed gracefully');
    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ INITIALIZATION ERROR:');
    console.error('─'.repeat(70));
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code || 'UNKNOWN'}`);
    
    if (error.code === 13 || error.code === 'EAUTH') {
      console.error('\n💡 Authentication Error - Check your MongoDB Atlas credentials:');
      console.error('  • Verify username and password in MONGODB_URI');
      console.error('  • Ensure your IP is whitelisted in MongoDB Atlas');
      console.error('  • Check connection string format');
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.error('\n💡 Connection Refused - Check your MongoDB connection:');
      console.error('  • For local MongoDB: ensure mongod is running');
      console.error('  • For MongoDB Atlas: verify internet connection');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS Resolution Failed:');
      console.error('  • Check your MONGODB_URI format');
      console.error('  • Verify cluster name is correct');
    }
    
    console.error('─'.repeat(70) + '\n');
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();

