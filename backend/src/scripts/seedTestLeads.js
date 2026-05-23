const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const { Admin, Client, Lead } = require("../models/index");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");

    const admin = await Admin.findOneActive();
    if (!admin) {
      console.error("No admin found in DB. Please create an Admin first.");
      process.exit(1);
    }

    const baseMobile = 9000000000; // will add 1..10
    const created = [];

    for (let i = 1; i <= 10; i++) {
      const mobile = (baseMobile + i).toString();
      const clientData = {
        admin: admin._id,
        name: `Test Lead ${i}`,
        email: `test.lead${i}@example.com`,
        mobile,
        companyName: `TestCorp ${i}`,
        source: "MANUAL",
        addedBy: null,
      };

      const client = await Client.findOneAndUpdate(
        { admin: admin._id, mobile },
        { $setOnInsert: clientData },
        { upsert: true, new: true },
      );

      const leadData = {
        admin: admin._id,
        client: client._id,
        status: "UNTOUCHED",
      };

      const lead = await Lead.findOneAndUpdate(
        { admin: admin._id, client: client._id },
        { $setOnInsert: leadData },
        { upsert: true, new: true },
      );

      created.push({
        mobile,
        clientId: client._id.toString(),
        leadId: lead._id.toString(),
      });
      console.log(`Created/Found lead ${i}: mobile=${mobile} lead=${lead._id}`);
    }

    console.log("Summary:");
    console.table(created);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding test leads:", err.message);
    process.exit(1);
  }
};

run();
