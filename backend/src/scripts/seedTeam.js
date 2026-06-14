const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const { Admin, User, Team } = require("../models");

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

    const salesTL = await User.findOne({
      admin: admin._id,
      email: "sales.tl.again@test.com",
    });

    const salesExecutive = await User.findOne({
      admin: admin._id,
      email: "sales.executive.again@test.com",
    });

    if (!salesTL || !salesExecutive) {
      console.log("Sales TL or Executive not found");
      process.exit(1);
    }

    const existingTeam = await Team.findOne({
      admin: admin._id,
      leader: salesTL._id,
      isDeleted: false,
    });

    if (existingTeam) {
      console.log("Team already exists");
      process.exit(0);
    }

    const team = await Team.create({
      admin: admin._id,
      name: "Team Alpha",

      leader: salesTL._id,

      members: [
        {
          user: salesExecutive._id,
          joinedAt: new Date(),
        },
      ],

      department: salesTL.department,

      isActive: true,
      isDeleted: false,
    });

    console.log("Team created successfully");
    console.log({
      teamId: team._id,
      teamName: team.name,
      leader: salesTL.email,
      member: salesExecutive.email,
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
