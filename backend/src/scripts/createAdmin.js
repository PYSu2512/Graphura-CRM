const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const { Admin } = require("../models");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await Admin.findOne({
      email: "admin@test.com",
    });

    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await Admin.create({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      phone: "9876543210",
      isActive: true,
    });

    console.log("Admin created:");
    console.log({
      email: admin.email,
      password: "Admin@123",
      id: admin._id,
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
