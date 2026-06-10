const { Admin } = require("../models/index");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

exports.getAdminProfile = catchAsync(async (req, res, next) => {
  // Find the admin using the ID populated by requireAdmin middleware
  const admin = await Admin.findById(req.admin._id).select("-password");

  if (!admin) {
    return next(new AppError("Admin profile not found", 404));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          company: {
            name: admin.company?.name || "",
            email: admin.company?.email || "",
            phone: admin.company?.phone || "",
            website: admin.company?.website || "",
            address: admin.company?.address || {},
          },
          createdAt: admin.createdAt,
        },
      },
      "Admin profile fetched successfully",
    ),
  );
});
exports.updateAdminProfile = catchAsync(async (req, res, next) => {
  const { name, email, phone } = req.body;

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  if (name) admin.name = name;
  if (phone) admin.phone = phone;

  if (email) {
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
      _id: { $ne: admin._id },
    });

    if (existingAdmin) {
      return next(new AppError("Email already in use", 409));
    }

    admin.email = email.toLowerCase();
  }

  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { admin }, "Profile updated successfully"));
});
