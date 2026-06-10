const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const { Admin, Department, User } = require("../models");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const admin = await Admin.findOne({
      email: "admin@test.com",
    });

    if (!admin) {
      console.log("Admin not found");
      process.exit(1);
    }

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
        isActive: true,
      });

      console.log("SALES department created");
    }

    // Prevent duplicate seeding
    const existingManager = await User.findOne({
      admin: admin._id,
      email: "sales.manager@test.com",
    });

    if (existingManager) {
      console.log("Sales hierarchy already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Sales@123", 10);

    // =====================================================
    // SALES MANAGER
    // =====================================================
    const manager = await User.create({
      admin: admin._id,
      department: salesDept._id,

      name: "Sales Manager",
      email: "sales.manager@test.com",
      password: hashedPassword,

      phone: "9100000001",

      role: "SALES_MANAGER",

      isActive: true,
      approvalStatus: "APPROVED",

      mustChangePassword: false,
      isFirstLogin: false,

      isProfileComplete: true,
      prereqCompleted: true,
      prereqStep: "completed",

      bankDetails: {
        beneficiaryName: "Sales Manager",
        bankName: "State Bank of India",
        accountNumber: "2234567891",
        ifscCode: "SBIN0001234",
        verified: true,
      },
    });

    console.log("Sales Manager created");

    // =====================================================
    // SALES TEAM LEADER
    // =====================================================
    const teamLeader = await User.create({
      admin: admin._id,
      department: salesDept._id,

      name: "Sales Team Leader",
      email: "sales.tl@test.com",
      password: hashedPassword,

      phone: "9100000002",

      role: "SALES_TL",

      manager: manager._id,

      isActive: true,
      approvalStatus: "APPROVED",

      mustChangePassword: false,
      isFirstLogin: false,

      isProfileComplete: true,
      prereqCompleted: true,
      prereqStep: "completed",

      bankDetails: {
        beneficiaryName: "Sales TL",
        bankName: "State Bank of India",
        accountNumber: "2234567892",
        ifscCode: "SBIN0001234",
        verified: true,
      },
    });

    console.log("Sales TL created");

    // =====================================================
    // SALES EXECUTIVE
    // =====================================================
    const executive = await User.create({
      admin: admin._id,
      department: salesDept._id,

      name: "Sales Executive",
      email: "sales.executive@test.com",
      password: hashedPassword,

      phone: "9100000003",

      role: "SALES_EXECUTIVE",

      manager: teamLeader._id,

      isActive: true,
      approvalStatus: "APPROVED",

      mustChangePassword: false,
      isFirstLogin: false,

      isProfileComplete: true,
      prereqCompleted: true,
      prereqStep: "completed",

      bankDetails: {
        beneficiaryName: "Sales Executive",
        bankName: "State Bank of India",
        accountNumber: "2234567893",
        ifscCode: "SBIN0001234",
        verified: true,
      },
    });

    console.log("Sales Executive created");

    console.log("\nSales hierarchy seeded successfully");

    console.log({
      manager: manager.email,
      teamLeader: teamLeader.email,
      executive: executive.email,
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
