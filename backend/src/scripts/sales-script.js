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

    // Create department if missing
    if (!salesDept) {
      salesDept = await Department.create({
        admin: admin._id,
        name: "SALES",
        displayName: "Sales",
        isActive: true,
      });

      console.log("SALES department created");
    }

    // Prevent duplicate users
    const existingUser = await User.findOne({
      email: "sales@test.com",
    });

    if (existingUser) {
      console.log("User already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash("User@123", 10);

    const user = await User.create({
      admin: admin._id,
      department: salesDept._id,
      name: "Sales Manager",
      email: "sales@test.com",
      password: hashed,
      phone: "9999999999",
      role: "SALES_MANAGER",
      isActive: true,
    });

    console.log("Sales manager created:");
    console.log({
      email: user.email,
      password: "User@123",
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
