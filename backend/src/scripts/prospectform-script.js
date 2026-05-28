const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const {
  Admin,
  Lead,
  Client,
  User,
  ProspectForm,
  Department,
} = require("../models");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("Connected to MongoDB");

    // ------------------------------------------------
    // 1. Find Admin
    // ------------------------------------------------
    const admin = await Admin.findOneActive({
      email: "admin@test.com",
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // ------------------------------------------------
    // 2. Find User (filledBy)
    // ------------------------------------------------
    let salesUser = await User.findOne({
      admin: admin._id,
      role: "SALES_EXECUTIVE",
      isDeleted: false,
    });

    // ------------------------------------------------
    // Auto-create SALES_EXECUTIVE if missing
    // ------------------------------------------------
    if (!salesUser) {
      console.log("No SALES_EXECUTIVE found. Creating seed user...");

      // Find SALES department
      let salesDept = await Department.findOne({
        admin: admin._id,
        name: "SALES",
      });

      // Create SALES department if missing
      if (!salesDept) {
        salesDept = await Department.create({
          admin: admin._id,

          name: "SALES",

          displayName: "Sales",

          isDefault: true,

          isActive: true,
        });

        console.log("SALES department created");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash("User@123", 10);

      // Create SALES_EXECUTIVE
      salesUser = await User.create({
        admin: admin._id,

        department: salesDept._id,

        name: "Seed Sales Executive",

        email: "seed.sales@test.com",

        password: hashedPassword,

        phone: "9999999999",

        role: "SALES_EXECUTIVE",

        isActive: true,
      });

      console.log("Seed SALES_EXECUTIVE created");

      console.log({
        email: salesUser.email,
        password: "User@123",
      });
    }

    // ------------------------------------------------
    // 3. Find Leads for Admin
    // ------------------------------------------------
    const leads = await Lead.find({
      admin: admin._id,
    }).populate("client");

    if (!leads.length) {
      throw new Error("No leads found");
    }

    const created = [];

    // ------------------------------------------------
    // 4. Create ProspectForms
    // ------------------------------------------------
    for (const lead of leads) {
      // Prevent duplicate prospect forms
      const existing = await ProspectForm.findOne({
        admin: admin._id,
        lead: lead._id,
      });

      if (existing) {
        console.log(`Prospect already exists for lead ${lead._id}`);
        continue;
      }

      const prospect = await ProspectForm.create({
        admin: admin._id,

        lead: lead._id,

        // IMPORTANT:
        // use the SAME client attached to lead
        client: lead.client._id,

        filledBy: salesUser._id,

        contactPerson: lead.client.name,

        company: lead.client.companyName,

        value: 50000,

        probability: 70,

        stage: "Interested",

        priority: "Medium",

        requirement: "Website redesign + SEO services",

        budget: 45000,

        notes: "Client interested in long term engagement",

        suggestedServices: [],

        finalServices: [],

        totalAmount: 50000,

        discount: 5000,

        finalAmount: 45000,

        status: "OPEN",
      });

      created.push({
        leadId: lead._id.toString(),
        prospectId: prospect._id.toString(),
      });

      console.log(`Created prospect for lead ${lead._id}`);
    }

    console.table(created);

    await mongoose.disconnect();

    console.log("Disconnected");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
