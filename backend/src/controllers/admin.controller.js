const { Admin } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

exports.getAdminProfile = catchAsync(async (req, res, next) => {
  // Find the admin using the ID populated by requireAdmin middleware
  const admin = await Admin.findById(req.admin._id).select('-password');

  if (!admin) {
    return next(new AppError('Admin profile not found', 404));
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
            name: admin.company?.name || '',
            email: admin.company?.email || '',
            phone: admin.company?.phone || '',
            website: admin.company?.website || '',
            address: admin.company?.address || {}
          },
          createdAt: admin.createdAt
        }
      },
      'Admin profile fetched successfully'
    )
  );
});
