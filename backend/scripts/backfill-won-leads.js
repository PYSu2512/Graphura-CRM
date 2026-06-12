/**
 * backfill-won-leads.js
 *
 * One-time script to fix leads that are stuck in INTERESTED status
 * even though their prospect form has paymentStatus = 'SUCCESS'.
 *
 * Run with: node scripts/backfill-won-leads.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function run() {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
  console.log('Connected.\n');

  // Lazy-load models after connection
  const { ProspectForm, Lead, Client } = require('../src/models');

  // Find all prospect forms that have been paid (paymentStatus = SUCCESS)
  // but whose linked lead is NOT CONVERTED yet
  const paidProspects = await ProspectForm.find({
    paymentStatus: 'SUCCESS',
    lead: { $ne: null },
  }).lean();

  console.log(`Found ${paidProspects.length} paid prospect(s) to check.\n`);

  let fixed = 0;
  let alreadyConverted = 0;
  let noLead = 0;

  for (const prospect of paidProspects) {
    const lead = await Lead.findOne({
      _id: prospect.lead,
      isDeleted: { $ne: true },
    });

    if (!lead) {
      console.log(`  [SKIP] Prospect ${prospect._id} — lead not found`);
      noLead++;
      continue;
    }

    if (lead.status === 'CONVERTED') {
      console.log(`  [OK]   Lead ${lead._id} (${lead.status}) — already converted`);
      alreadyConverted++;
      continue;
    }

    const prevStatus = lead.status;
    lead.status = 'CONVERTED';
    lead.isDumped = false;
    lead.dumpReason = null;
    lead.dumpedAt = null;
    lead.dumpedBy = null;
    if (!lead.convertedAt) {
      lead.convertedAt = prospect.paymentVerifiedAt || new Date();
    }
    if (!lead.convertedBy && prospect.filledBy) {
      lead.convertedBy = prospect.filledBy;
    }
    await lead.save();

    // Also update Client.prospectStatus → CLOSED_WON
    if (prospect.client) {
      await Client.updateOne(
        { _id: prospect.client },
        { $set: { prospectStatus: 'CLOSED_WON' } }
      );
    }

    console.log(`  [FIXED] Lead ${lead._id}: ${prevStatus} → CONVERTED  (prospect: ${prospect._id})`);
    fixed++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Fixed:            ${fixed}`);
  console.log(`  Already converted: ${alreadyConverted}`);
  console.log(`  Lead not found:   ${noLead}`);
  console.log(`  Total checked:    ${paidProspects.length}`);

  await mongoose.disconnect();
  console.log('\nDone. Disconnected.');
}

run().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
