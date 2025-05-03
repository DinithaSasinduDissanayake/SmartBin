const RecyclingRequest = require('../models/RecyclingRequest');
const AdminRecyclingRequest = require('../models/AdminRecyclingRequest');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new recycling request (for users)
exports.createRecyclingRequest = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    contact,
    wasteType,
    quantity,
    community,
    pickupLocation,
    preferredPickupDateTime,
    collectionPreference,
    amount,
  } = req.body;

  // Basic validation (can be enhanced with a validation library like Joi or express-validator)
  if (
    !name || !email || !contact || !wasteType || !quantity || !community ||
    !pickupLocation || !preferredPickupDateTime || !collectionPreference || amount === undefined
  ) {
    return next(new AppError('All fields are required', 400));
  }

  const parsedQuantity = parseFloat(quantity);
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return next(new AppError('Quantity must be a positive number', 400));
  }
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return next(new AppError('Amount must be a non-negative number', 400));
  }

  // Save to user collection
  const newUserRequest = await RecyclingRequest.create({
    name,
    email,
    contact,
    wasteType,
    quantity: parsedQuantity,
    community,
    pickupLocation,
    preferredPickupDateTime: new Date(preferredPickupDateTime),
    collectionPreference,
    amount: parsedAmount,
    status: 'Pending',
  });

  // Save to admin collection (consider if this duplication is necessary or if admin can query user requests)
  // If needed, ensure AdminRecyclingRequest schema matches expected fields
  await AdminRecyclingRequest.create({
    name,
    email,
    contact,
    wasteType,
    quantity: parsedQuantity,
    community,
    pickupLocation,
    preferredPickupDateTime, // Keep as string if admin schema expects string
    collectionPreference,
    amount: parsedAmount, // Add amount if needed in admin schema
    status: 'Pending',
    userRequestId: newUserRequest._id, // Link to the user request
  });

  res.status(201).json({
    status: 'success',
    data: {
      request: newUserRequest,
    },
  });
});

// Get all recycling requests (for users)
exports.getAllRecyclingRequests = catchAsync(async (req, res, next) => {
  // TODO: Add filtering/pagination/sorting based on user (e.g., req.user.id)
  const requests = await RecyclingRequest.find(); // Fetch all for now

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: {
      requests,
    },
  });
});

// Add other controller functions as needed (get one, update, delete for user/admin)
