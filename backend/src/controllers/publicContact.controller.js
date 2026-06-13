const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");
const { ContactQuery } = require("../models");
const {
  sendContactAcknowledgementEmail,
} = require("../services/email.service");

exports.submitContactQuery = catchAsync(async (req, res, next) => {
  const { name, company, email, phone, message } = req.body;

  if (!name?.trim() || !company?.trim() || !email?.trim() || !message?.trim()) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  const query = await ContactQuery.create({
    name,
    company,
    email,
    phone,
    message,
    source: "Landing Page",
  });

  // Send acknowledgement email without failing the request if it fails
  sendContactAcknowledgementEmail(name, email).catch((err) => {
    console.error("Failed to send contact acknowledgement email:", err);
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        query,
        "Your query has been submitted successfully.",
      ),
    );
});
