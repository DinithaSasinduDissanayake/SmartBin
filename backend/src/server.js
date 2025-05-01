// // // // require('dotenv').config();
// // // // const express = require('express');
// // // // const mongoose = require('mongoose');
// // // // const cors = require('cors');
// // // // const RecyclingRequest = require('./models/RecyclingRequest');
// // // // const AdminRecyclingRequest = require('./models/AdminRecyclingRequest');

// // // // const app = express();
// // // // const port = 5000;

// // // // // Middleware
// // // // app.use(express.json());
// // // // app.use(cors({ origin: 'http://localhost:5173' }));

// // // // // MongoDB Connection
// // // // const mongoURI = process.env.MONGO_URI;

// // // // mongoose.connect(mongoURI, {
// // // //   serverSelectionTimeoutMS: 30000,
// // // // })
// // // //   .then(() => console.log('MongoDB connected successfully'))
// // // //   .catch(err => console.error('MongoDB connection error:', err));

// // // // // Add connection event listeners for better debugging
// // // // mongoose.connection.on('connected', () => {
// // // //   console.log('Mongoose connected to MongoDB');
// // // // });

// // // // mongoose.connection.on('error', (err) => {
// // // //   console.error('Mongoose connection error:', err);
// // // // });

// // // // mongoose.connection.on('disconnected', () => {
// // // //   console.log('Mongoose disconnected from MongoDB');
// // // // });

// // // // // API Endpoints

// // // // app.post('/api/recycling-request', async (req, res) => {
// // // //   try {
// // // //     const {
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime,
// // // //       collectionPreference,
// // // //       amount,
// // // //     } = req.body;
// // // //     console.log('Received request data:', req.body);

// // // //     // Validate required fields
// // // //     if (
// // // //       !name ||
// // // //       !email ||
// // // //       !contact ||
// // // //       !wasteType ||
// // // //       !quantity ||
// // // //       !community ||
// // // //       !pickupLocation ||
// // // //       !preferredPickupDateTime ||
// // // //       !collectionPreference ||
// // // //       amount === undefined
// // // //     ) {
// // // //       return res.status(400).json({ message: 'All fields are required' });
// // // //     }

// // // //     // Validate quantity
// // // //     const parsedQuantity = parseFloat(quantity);
// // // //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// // // //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// // // //     }

// // // //     // Validate amount
// // // //     const parsedAmount = parseFloat(amount);
// // // //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// // // //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// // // //     }

// // // //     // Validate wasteType
// // // //     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
// // // //     if (!validWasteTypes.includes(wasteType)) {
// // // //       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
// // // //     }

// // // //     // Validate collectionPreference
// // // //     const validCollectionPreferences = ['Delivery', 'Self-pickup'];
// // // //     if (!validCollectionPreferences.includes(collectionPreference)) {
// // // //       return res.status(400).json({ message: 'Invalid collection preference. Must be Delivery or Self-pickup' });
// // // //     }

// // // //     // Save to user collection
// // // //     const newUserRequest = new RecyclingRequest({
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity: parsedQuantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime: new Date(preferredPickupDateTime), // Convert to Date
// // // //       collectionPreference,
// // // //       amount: parsedAmount,
// // // //       status: 'Pending',
// // // //     });
// // // //     await newUserRequest.save();

// // // //     // Save to admin collection
// // // //     const newAdminRequest = new AdminRecyclingRequest({
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity: parsedQuantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime, // Store as string for AdminRecyclingRequest
// // // //       collectionPreference,
// // // //       status: 'Pending',
// // // //       userRequestId: newUserRequest._id,
// // // //     });
// // // //     await newAdminRequest.save();

// // // //     console.log('Saved user request:', newUserRequest);
// // // //     console.log('Saved admin request:', newAdminRequest);
// // // //     res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
// // // //   } catch (error) {
// // // //     console.error('Error submitting request:', error);
// // // //     if (error.name === 'ValidationError') {
// // // //       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
// // // //     }
// // // //     res.status(500).json({ message: 'Error submitting request', error: error.message });
// // // //   }
// // // // });

// // // // app.get('/api/recycling-requests', async (req, res) => {
// // // //   try {
// // // //     const requests = await RecyclingRequest.find();
// // // //     console.log('Fetched user requests:', requests);
// // // //     res.status(200).json(requests);
// // // //   } catch (error) {
// // // //     console.error('Error fetching user requests:', error);
// // // //     res.status(500).json({ message: 'Error fetching user requests', error: error.message });
// // // //   }
// // // // });

// // // // // Get All Recycling Requests for Admin (Recycling Requests page)
// // // // app.get('/api/admin/recycling-requests', async (req, res) => {
// // // //   try {
// // // //     const requests = await AdminRecyclingRequest.find();
// // // //     console.log('Fetched admin requests:', requests);
// // // //     res.status(200).json(requests);
// // // //   } catch (error) {
// // // //     console.error('Error fetching admin requests:', error);
// // // //     res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
// // // //   }
// // // // });

// // // // // Get a Single Recycling Request by ID for Users (My Order Details page)
// // // // app.get('/api/recycling-request/:id', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
// // // //     console.log('Fetching user request with ID:', id);
// // // //     const request = await RecyclingRequest.findById(id);
// // // //     console.log('Found user request:', request);
// // // //     if (!request) {
// // // //       return res.status(404).json({ message: 'Request not found' });
// // // //     }
// // // //     res.status(200).json(request);
// // // //   } catch (error) {
// // // //     console.error('Error fetching user request:', error);
// // // //     res.status(500).json({ message: 'Error fetching user request', error: error.message });
// // // //   }
// // // // });

// // // // // Get a Single Recycling Request by ID for Admin (Recycling Order Details page)
// // // // app.get('/api/admin/recycling-request/:id', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
// // // //     console.log('Fetching admin request with ID:', id);
// // // //     const request = await AdminRecyclingRequest.findById(id);
// // // //     console.log('Found admin request:', request);
// // // //     if (!request) {
// // // //       return res.status(404).json({ message: 'Request not found' });
// // // //     }
// // // //     res.status(200).json(request);
// // // //   } catch (error) {
// // // //     console.error('Error fetching admin request:', error);
// // // //     res.status(500).json({ message: 'Error fetching admin request', error: error.message });
// // // //   }
// // // // });

// // // // // Update a Recycling Request by ID for Users (UpdateOrder page)
// // // // // app.put('/api/recycling-request/:id', async (req, res) => {
// // // // //   try {
// // // // //     const { id } = req.params;
// // // // //     const { name, email, contact, wasteType, quantity, community, pickupLocation, preferredPickupDateTime, collectionPreference } = req.body;
// // // // //     console.log('Received update data for ID:', id, req.body);
// // // // //     if (!name || !email || !contact || !wasteType || !quantity || !community || !pickupLocation || !preferredPickupDateTime || !collectionPreference) {
// // // // //       return res.status(400).json({ message: 'All fields are required' });
// // // // //     }

// // // // //     // Update the user request
// // // // //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// // // // //       id,
// // // // //       { 
// // // // //         name, 
// // // // //         email, 
// // // // //         contact, 
// // // // //         wasteType, 
// // // // //         quantity: Number(quantity), 
// // // // //         community, 
// // // // //         pickupLocation, 
// // // // //         preferredPickupDateTime, 
// // // // //         collectionPreference 
// // // // //       },
// // // // //       { new: true }
// // // // //     );
// // // // //     if (!updatedUserRequest) {
// // // // //       return res.status(404).json({ message: 'User request not found' });
// // // // //     }

// // // // //     // Find and update the corresponding admin request using userRequestId
// // // // //     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
// // // // //       { userRequestId: id },
// // // // //       { 
// // // // //         name, 
// // // // //         email, 
// // // // //         contact, 
// // // // //         wasteType, 
// // // // //         quantity: Number(quantity), 
// // // // //         community, 
// // // // //         pickupLocation, 
// // // // //         preferredPickupDateTime, 
// // // // //         collectionPreference 
// // // // //       },
// // // // //       { new: true }
// // // // //     );
// // // // //     if (!updatedAdminRequest) {
// // // // //       console.warn('Corresponding admin request not found for userRequestId:', id);
// // // // //     }

// // // // //     console.log('Updated user request:', updatedUserRequest);
// // // // //     console.log('Updated admin request:', updatedAdminRequest);
// // // // //     res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
// // // // //   } catch (error) {
// // // // //     console.error('Error updating user request:', error);
// // // // //     res.status(500).json({ message: 'Error updating user request', error: error.message });
// // // // //   }
// // // // // });

// // // // app.put('/api/recycling-request/:id', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
// // // //     const {
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime,
// // // //       collectionPreference,
// // // //       amount,
// // // //     } = req.body;
// // // //     console.log('Received update data for ID:', id, req.body);

// // // //     // Validate required fields
// // // //     if (
// // // //       !name ||
// // // //       !email ||
// // // //       !contact ||
// // // //       !wasteType ||
// // // //       !quantity ||
// // // //       !community ||
// // // //       !pickupLocation ||
// // // //       !preferredPickupDateTime ||
// // // //       !collectionPreference ||
// // // //       amount === undefined
// // // //     ) {
// // // //       return res.status(400).json({ message: 'All fields are required' });
// // // //     }

// // // //     // Validate quantity
// // // //     const parsedQuantity = parseFloat(quantity);
// // // //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// // // //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// // // //     }

// // // //     // Validate amount
// // // //     const parsedAmount = parseFloat(amount);
// // // //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// // // //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// // // //     }

// // // //     // Validate wasteType
// // // //     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
// // // //     if (!validWasteTypes.includes(wasteType)) {
// // // //       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
// // // //     }

// // // //     // Update the user request
// // // //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// // // //       id,
// // // //       {
// // // //         name,
// // // //         email,
// // // //         contact,
// // // //         wasteType,
// // // //         quantity: parsedQuantity,
// // // //         community,
// // // //         pickupLocation,
// // // //         preferredPickupDateTime: new Date(preferredPickupDateTime),
// // // //         collectionPreference,
// // // //         amount: parsedAmount,
// // // //       },
// // // //       { new: true }
// // // //     );
// // // //     if (!updatedUserRequest) {
// // // //       return res.status(404).json({ message: 'User request not found' });
// // // //     }

// // // //     // Update the corresponding admin request
// // // //     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
// // // //       { userRequestId: id },
// // // //       {
// // // //         name,
// // // //         email,
// // // //         contact,
// // // //         wasteType,
// // // //         quantity: parsedQuantity,
// // // //         community,
// // // //         pickupLocation,
// // // //         preferredPickupDateTime,
// // // //         collectionPreference,
// // // //       },
// // // //       { new: true }
// // // //     );
// // // //     if (!updatedAdminRequest) {
// // // //       console.warn('Corresponding admin request not found for userRequestId:', id);
// // // //     }

// // // //     console.log('Updated user request:', updatedUserRequest);
// // // //     console.log('Updated admin request:', updatedAdminRequest);
// // // //     res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
// // // //   } catch (error) {
// // // //     console.error('Error updating user request:', error);
// // // //     if (error.name === 'ValidationError') {
// // // //       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
// // // //     }
// // // //     res.status(500).json({ message: 'Error updating user request', error: error.message });
// // // //   }
// // // // });

// // // // // Update Status of a Recycling Request by ID for Admin (Update Status button)
// // // // app.put('/api/admin/recycling-request/:id', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
// // // //     const { status } = req.body;
// // // //     console.log('Received update status data for ID:', id, req.body);
// // // //     if (!status) {
// // // //       return res.status(400).json({ message: 'Status is required' });
// // // //     }

// // // //     // Update the admin request
// // // //     const updatedAdminRequest = await AdminRecyclingRequest.findByIdAndUpdate(
// // // //       id,
// // // //       { status },
// // // //       { new: true }
// // // //     );
// // // //     if (!updatedAdminRequest) {
// // // //       return res.status(404).json({ message: 'Admin request not found' });
// // // //     }

// // // //     // Update the corresponding user request using userRequestId
// // // //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// // // //       updatedAdminRequest.userRequestId,
// // // //       { status },
// // // //       { new: true }
// // // //     );
// // // //     if (!updatedUserRequest) {
// // // //       console.warn('Corresponding user request not found for ID:', updatedAdminRequest.userRequestId);
// // // //     }

// // // //     console.log('Updated admin request:', updatedAdminRequest);
// // // //     console.log('Updated user request:', updatedUserRequest);
// // // //     res.status(200).json({ message: 'Status updated successfully', data: updatedAdminRequest });
// // // //   } catch (error) {
// // // //     console.error('Error updating admin request status:', error);
// // // //     res.status(500).json({ message: 'Error updating admin request status', error: error.message });
// // // //   }
// // // // });

// // // // // Delete a Recycling Request by ID (Separate endpoints for user and admin)
// // // // app.delete('/api/recycling-request/:id', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
// // // //     console.log('Deleting user request with ID:', id);
// // // //     const deletedRequest = await RecyclingRequest.findByIdAndDelete(id);
// // // //     if (!deletedRequest) {
// // // //       return res.status(404).json({ message: 'Request not found' });
// // // //     }
// // // //     res.status(200).json({ message: 'User request deleted successfully' });
// // // //   } catch (error) {
// // // //     console.error('Error deleting user request:', error);
// // // //     res.status(500).json({ message: 'Error deleting user request', error: error.message });
// // // //   }
// // // // });

// // // // app.delete('/api/admin/recycling-request/:id', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.params;
// // // //     console.log('Deleting admin request with ID:', id);
// // // //     const deletedRequest = await AdminRecyclingRequest.findByIdAndDelete(id);
// // // //     if (!deletedRequest) {
// // // //       return res.status(404).json({ message: 'Request not found' });
// // // //     }
// // // //     res.status(200).json({ message: 'Admin request deleted successfully' });
// // // //   } catch (error) {
// // // //     console.error('Error deleting admin request:', error);
// // // //     res.status(500).json({ message: 'Error deleting admin request', error: error.message });
// // // //   }
// // // // });

// // // // // Handle 404 errors (return JSON instead of HTML)
// // // // app.use((req, res) => {
// // // //   res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.url}` });
// // // // });

// // // // // Start Server
// // // // app.listen(port, () => {
// // // //   console.log(`Server running on http://localhost:${port}`);
// // // // });













// // // require('dotenv').config();
// // // const express = require('express');
// // // const mongoose = require('mongoose');
// // // const cors = require('cors');
// // // const RecyclingRequest = require('./models/RecyclingRequest');
// // // const AdminRecyclingRequest = require('./models/AdminRecyclingRequest');

// // // const app = express();
// // // const port = 5000;

// // // // Middleware
// // // app.use(express.json());
// // // app.use(cors({ origin: 'http://localhost:5173' }));

// // // // MongoDB Connection
// // // const mongoURI = process.env.MONGO_URI;

// // // mongoose.connect(mongoURI, {
// // //   serverSelectionTimeoutMS: 30000,
// // // })
// // //   .then(() => console.log('MongoDB connected successfully'))
// // //   .catch(err => console.error('MongoDB connection error:', err));

// // // // Add connection event listeners for better debugging
// // // mongoose.connection.on('connected', () => {
// // //   console.log('Mongoose connected to MongoDB');
// // // });

// // // mongoose.connection.on('error', (err) => {
// // //   console.error('Mongoose connection error:', err);
// // // });

// // // mongoose.connection.on('disconnected', () => {
// // //   console.log('Mongoose disconnected from MongoDB');
// // // });

// // // // API Endpoints

// // // // app.post('/api/recycling-request', async (req, res) => {
// // // //   try {
// // // //     const {
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime,
// // // //       collectionPreference,
// // // //       amount,
// // // //     } = req.body;
// // // //     console.log('Received request data:', req.body);

// // // //     // Validate required fields
// // // //     if (
// // // //       !name ||
// // // //       !email ||
// // // //       !contact ||
// // // //       !wasteType ||
// // // //       !quantity ||
// // // //       !community ||
// // // //       !pickupLocation ||
// // // //       !preferredPickupDateTime ||
// // // //       !collectionPreference ||
// // // //       amount === undefined
// // // //     ) {
// // // //       return res.status(400).json({ message: 'All fields are required' });
// // // //     }

// // // //     // Validate quantity
// // // //     const parsedQuantity = parseFloat(quantity);
// // // //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// // // //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// // // //     }

// // // //     // Validate amount
// // // //     const parsedAmount = parseFloat(amount);
// // // //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// // // //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// // // //     }

// // // //     // Validate wasteType
// // // //     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
// // // //     if (!validWasteTypes.includes(wasteType)) {
// // // //       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
// // // //     }

// // // //     // Validate collectionPreference
// // // //     const validCollectionPreferences = ['Delivery', 'Self-pickup'];
// // // //     if (!validCollectionPreferences.includes(collectionPreference)) {
// // // //       return res.status(400).json({ message: 'Invalid collection preference. Must be Delivery or Self-pickup' });
// // // //     }

// // // //     // Save to user collection
// // // //     const newUserRequest = new RecyclingRequest({
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity: parsedQuantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime: new Date(preferredPickupDateTime),
// // // //       collectionPreference,
// // // //       amount: parsedAmount,
// // // //       status: 'Pending',
// // // //     });
// // // //     await newUserRequest.save();

// // // //     // Save to admin collection
// // // //     const newAdminRequest = new AdminRecyclingRequest({
// // // //       name,
// // // //       email,
// // // //       contact,
// // // //       wasteType,
// // // //       quantity: parsedQuantity,
// // // //       community,
// // // //       pickupLocation,
// // // //       preferredPickupDateTime,
// // // //       collectionPreference,
// // // //       status: 'Pending',
// // // //       userRequestId: newUserRequest._id,
// // // //     });
// // // //     await newAdminRequest.save();

// // // //     console.log('Saved user request:', newUserRequest);
// // // //     console.log('Saved admin request:', newAdminRequest);
// // // //     res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
// // // //   } catch (error) {
// // // //     console.error('Error submitting request:', error);
// // // //     if (error.name === 'ValidationError') {
// // // //       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
// // // //     }
// // // //     res.status(500).json({ message: 'Error submitting request', error: error.message });
// // // //   }
// // // // });

// // // // // Get All Recycling Requests for Users (My Orders page)
// // // // app.get('/api/recycling-requests', async (req, res) => {
// // // //   try {
// // // //     const { search } = req.query;
// // // //     let query = {};

// // // //     if (search) {
// // // //       const searchRegex = new RegExp(search, 'i');
// // // //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search); // Check if search is a valid MongoDB ObjectId
// // // //       query = {
// // // //         $or: [
// // // //           { name: searchRegex },
// // // //           { email: searchRegex },
// // // //           ...(isMongoId ? [{ _id: search }] : []),
// // // //         ],
// // // //       };
// // // //     }

// // // //     const requests = await RecyclingRequest.find(query);
// // // //     console.log('Fetched user requests:', requests);
// // // //     res.status(200).json(requests);
// // // //   } catch (error) {
// // // //     console.error('Error fetching user requests:', error);
// // // //     res.status(500).json({ message: 'Error fetching user requests', error: error.message });
// // // //   }
// // // // });

// // // app.post('/api/recycling-request', async (req, res) => {
// // //   try {
// // //     const {
// // //       name,
// // //       email,
// // //       contact,
// // //       wasteType,
// // //       quantity,
// // //       community,
// // //       pickupLocation,
// // //       preferredPickupDateTime,
// // //       collectionPreference,
// // //       amount,
// // //     } = req.body;
// // //     console.log('Received request data:', req.body);

// // //     // Validate required fields
// // //     if (
// // //       !name ||
// // //       !email ||
// // //       !contact ||
// // //       !wasteType ||
// // //       !quantity ||
// // //       !community ||
// // //       !pickupLocation ||
// // //       !preferredPickupDateTime ||
// // //       !collectionPreference ||
// // //       amount === undefined
// // //     ) {
// // //       return res.status(400).json({ message: 'All fields are required' });
// // //     }

// // //     // Validate quantity
// // //     const parsedQuantity = parseFloat(quantity);
// // //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// // //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// // //     }

// // //     // Validate amount
// // //     const parsedAmount = parseFloat(amount);
// // //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// // //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// // //     }

// // //     // Validate wasteType
// // //     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
// // //     if (!validWasteTypes.includes(wasteType)) {
// // //       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
// // //     }

// // //     // Generate orderId
// // //     const lastRequest = await RecyclingRequest.findOne().sort({ createdAt: -1 });
// // //     const newOrderId = lastRequest ? String(Number(lastRequest.orderId) + 1).padStart(3, '0') : '001';

// // //     // Save to user collection
// // //     const newUserRequest = new RecyclingRequest({
// // //       orderId: newOrderId,
// // //       name,
// // //       email,
// // //       contact,
// // //       wasteType,
// // //       quantity: parsedQuantity,
// // //       community,
// // //       pickupLocation,
// // //       preferredPickupDateTime: new Date(preferredPickupDateTime),
// // //       collectionPreference,
// // //       amount: parsedAmount,
// // //       status: 'Pending',
// // //     });
// // //     await newUserRequest.save();

// // //     // Save to admin collection
// // //     const newAdminRequest = new AdminRecyclingRequest({
// // //       orderId: newOrderId,
// // //       name,
// // //       email,
// // //       contact,
// // //       wasteType,
// // //       quantity: parsedQuantity,
// // //       community,
// // //       pickupLocation,
// // //       preferredPickupDateTime,
// // //       collectionPreference,
// // //       status: 'Pending',
// // //       userRequestId: newUserRequest._id,
// // //     });
// // //     await newAdminRequest.save();

// // //     console.log('Saved user request:', newUserRequest);
// // //     console.log('Saved admin request:', newAdminRequest);
// // //     res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
// // //   } catch (error) {
// // //     console.error('Error submitting request:', error);
// // //     if (error.name === 'ValidationError') {
// // //       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
// // //     }
// // //     res.status(500).json({ message: 'Error submitting request', error: error.message });
// // //   }
// // // });

// // // // Get All Recycling Requests for Admin (Recycling Requests page)
// // // // app.get('/api/admin/recycling-requests', async (req, res) => {
// // // //   try {
// // // //     const { search } = req.query;
// // // //     let query = {};

// // // //     if (search) {
// // // //       const searchRegex = new RegExp(search, 'i');
// // // //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
// // // //       query = {
// // // //         $or: [
// // // //           { name: searchRegex },
// // // //           { email: searchRegex },
// // // //           ...(isMongoId ? [{ _id: search }] : []),
// // // //         ],
// // // //       };
// // // //     }

// // // //     const requests = await AdminRecyclingRequest.find(query);
// // // //     console.log('Fetched admin requests:', requests);
// // // //     res.status(200).json(requests);
// // // //   } catch (error) {
// // // //     console.error('Error fetching admin requests:', error);
// // // //     res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
// // // //   }
// // // // });

// // // app.get('/api/recycling-requests', async (req, res) => {
// // //   try {
// // //     const { search } = req.query;
// // //     let query = {};

// // //     if (search) {
// // //       const searchRegex = new RegExp(search, 'i');
// // //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
// // //       query = {
// // //         $or: [
// // //           { name: searchRegex },
// // //           { email: searchRegex },
// // //           { orderId: search }, // Exact match for orderId
// // //           ...(isMongoId ? [{ _id: search }] : []),
// // //         ],
// // //       };
// // //     }

// // //     const requests = await RecyclingRequest.find(query);
// // //     console.log('Fetched user requests:', requests);
// // //     res.status(200).json(requests);
// // //   } catch (error) {
// // //     console.error('Error fetching user requests:', error);
// // //     res.status(500).json({ message: 'Error fetching user requests', error: error.message });
// // //   }
// // // });

// // // app.get('/api/admin/recycling-requests', async (req, res) => {
// // //   try {
// // //     const { search } = req.query;
// // //     let query = {};

// // //     if (search) {
// // //       const searchRegex = new RegExp(search, 'i');
// // //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
// // //       query = {
// // //         $or: [
// // //           { name: searchRegex },
// // //           { email: searchRegex },
// // //           { orderId: search },
// // //           ...(isMongoId ? [{ _id: search }] : []),
// // //         ],
// // //       };
// // //     }

// // //     const requests = await AdminRecyclingRequest.find(query);
// // //     console.log('Fetched admin requests:', requests);
// // //     res.status(200).json(requests);
// // //   } catch (error) {
// // //     console.error('Error fetching admin requests:', error);
// // //     res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
// // //   }
// // // });

// // // // Get a Single Recycling Request by ID for Users (My Order Details page)
// // // app.get('/api/recycling-request/:id', async (req, res) => {
// // //   try {
// // //     const { id } = req.params;
// // //     console.log('Fetching user request with ID:', id);
// // //     const request = await RecyclingRequest.findById(id);
// // //     console.log('Found user request:', request);
// // //     if (!request) {
// // //       return res.status(404).json({ message: 'Request not found' });
// // //     }
// // //     res.status(200).json(request);
// // //   } catch (error) {
// // //     console.error('Error fetching user request:', error);
// // //     res.status(500).json({ message: 'Error fetching user request', error: error.message });
// // //   }
// // // });

// // // // Get a Single Recycling Request by ID for Admin (Recycling Order Details page)
// // // app.get('/api/admin/recycling-request/:id', async (req, res) => {
// // //   try {
// // //     const { id } = req.params;
// // //     console.log('Fetching admin request with ID:', id);
// // //     const request = await AdminRecyclingRequest.findById(id);
// // //     console.log('Found admin request:', request);
// // //     if (!request) {
// // //       return res.status(404).json({ message: 'Request not found' });
// // //     }
// // //     res.status(200).json(request);
// // //   } catch (error) {
// // //     console.error('Error fetching admin request:', error);
// // //     res.status(500).json({ message: 'Error fetching admin request', error: error.message });
// // //   }
// // // });

// // // // Update a Recycling Request by ID for Users (UpdateOrder page)
// // // app.put('/api/recycling-request/:id', async (req, res) => {
// // //   try {
// // //     const { id } = req.params;
// // //     const {
// // //       name,
// // //       email,
// // //       contact,
// // //       wasteType,
// // //       quantity,
// // //       community,
// // //       pickupLocation,
// // //       preferredPickupDateTime,
// // //       collectionPreference,
// // //       amount,
// // //     } = req.body;
// // //     console.log('Received update data for ID:', id, req.body);

// // //     // Validate required fields
// // //     if (
// // //       !name ||
// // //       !email ||
// // //       !contact ||
// // //       !wasteType ||
// // //       !quantity ||
// // //       !community ||
// // //       !pickupLocation ||
// // //       !preferredPickupDateTime ||
// // //       !collectionPreference ||
// // //       amount === undefined
// // //     ) {
// // //       return res.status(400).json({ message: 'All fields are required' });
// // //     }

// // //     // Validate quantity
// // //     const parsedQuantity = parseFloat(quantity);
// // //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// // //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// // //     }

// // //     // Validate amount
// // //     const parsedAmount = parseFloat(amount);
// // //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// // //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// // //     }

// // //     // Validate wasteType
// // //     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
// // //     if (!validWasteTypes.includes(wasteType)) {
// // //       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
// // //     }

// // //     // Update the user request
// // //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// // //       id,
// // //       {
// // //         name,
// // //         email,
// // //         contact,
// // //         wasteType,
// // //         quantity: parsedQuantity,
// // //         community,
// // //         pickupLocation,
// // //         preferredPickupDateTime: new Date(preferredPickupDateTime),
// // //         collectionPreference,
// // //         amount: parsedAmount,
// // //       },
// // //       { new: true }
// // //     );
// // //     if (!updatedUserRequest) {
// // //       return res.status(404).json({ message: 'User request not found' });
// // //     }

// // //     // Update the corresponding admin request
// // //     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
// // //       { userRequestId: id },
// // //       {
// // //         name,
// // //         email,
// // //         contact,
// // //         wasteType,
// // //         quantity: parsedQuantity,
// // //         community,
// // //         pickupLocation,
// // //         preferredPickupDateTime,
// // //         collectionPreference,
// // //       },
// // //       { new: true }
// // //     );
// // //     if (!updatedAdminRequest) {
// // //       console.warn('Corresponding admin request not found for userRequestId:', id);
// // //     }

// // //     console.log('Updated user request:', updatedUserRequest);
// // //     console.log('Updated admin request:', updatedAdminRequest);
// // //     res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
// // //   } catch (error) {
// // //     console.error('Error updating user request:', error);
// // //     if (error.name === 'ValidationError') {
// // //       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
// // //     }
// // //     res.status(500).json({ message: 'Error updating user request', error: error.message });
// // //   }
// // // });

// // // // Update Status of a Recycling Request by ID for Admin (Update Status button)
// // // app.put('/api/admin/recycling-request/:id', async (req, res) => {
// // //   try {
// // //     const { id } = req.params;
// // //     const { status } = req.body;
// // //     console.log('Received update status data for ID:', id, req.body);
// // //     if (!status) {
// // //       return res.status(400).json({ message: 'Status is required' });
// // //     }

// // //     // Update the admin request
// // //     const updatedAdminRequest = await AdminRecyclingRequest.findByIdAndUpdate(
// // //       id,
// // //       { status },
// // //       { new: true }
// // //     );
// // //     if (!updatedAdminRequest) {
// // //       return res.status(404).json({ message: 'Admin request not found' });
// // //     }

// // //     // Update the corresponding user request using userRequestId
// // //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// // //       updatedAdminRequest.userRequestId,
// // //       { status },
// // //       { new: true }
// // //     );
// // //     if (!updatedUserRequest) {
// // //       console.warn('Corresponding user request not found for ID:', updatedAdminRequest.userRequestId);
// // //     }

// // //     console.log('Updated admin request:', updatedAdminRequest);
// // //     console.log('Updated user request:', updatedUserRequest);
// // //     res.status(200).json({ message: 'Status updated successfully', data: updatedAdminRequest });
// // //   } catch (error) {
// // //     console.error('Error updating admin request status:', error);
// // //     res.status(500).json({ message: 'Error updating admin request status', error: error.message });
// // //   }
// // // });

// // // // Delete a Recycling Request by ID (Separate endpoints for user and admin)
// // // app.delete('/api/recycling-request/:id', async (req, res) => {
// // //   try {
// // //     const { id } = req.params;
// // //     console.log('Deleting user request with ID:', id);
// // //     const deletedRequest = await RecyclingRequest.findByIdAndDelete(id);
// // //     if (!deletedRequest) {
// // //       return res.status(404).json({ message: 'Request not found' });
// // //     }
// // //     res.status(200).json({ message: 'User request deleted successfully' });
// // //   } catch (error) {
// // //     console.error('Error deleting user request:', error);
// // //     res.status(500).json({ message: 'Error deleting user request', error: error.message });
// // //   }
// // // });

// // // app.delete('/api/admin/recycling-request/:id', async (req, res) => {
// // //   try {
// // //     const { id } = req.params;
// // //     console.log('Deleting admin request with ID:', id);
// // //     const deletedRequest = await AdminRecyclingRequest.findByIdAndDelete(id);
// // //     if (!deletedRequest) {
// // //       return res.status(404).json({ message: 'Request not found' });
// // //     }
// // //     res.status(200).json({ message: 'Admin request deleted successfully' });
// // //   } catch (error) {
// // //     console.error('Error deleting admin request:', error);
// // //     res.status(500).json({ message: 'Error deleting admin request', error: error.message });
// // //   }
// // // });

// // // // Handle 404 errors (return JSON instead of HTML)
// // // app.use((req, res) => {
// // //   res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.url}` });
// // // });

// // // // Start Server
// // // app.listen(port, () => {
// // //   console.log(`Server running on http://localhost:${port}`);
// // // });



// // require('dotenv').config();
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const RecyclingRequest = require('./models/RecyclingRequest');
// // const AdminRecyclingRequest = require('./models/AdminRecyclingRequest');

// // const app = express();
// // const port = 5000;

// // // Middleware
// // app.use(express.json());
// // app.use(cors({ origin: 'http://localhost:5173' }));

// // // MongoDB Connection
// // const mongoURI = process.env.MONGO_URI;

// // if (!mongoURI) {
// //   console.error('MONGO_URI is not defined in .env');
// //   process.exit(1);
// // }

// // mongoose.connect(mongoURI, {
// //   serverSelectionTimeoutMS: 30000,
// // })
// //   .then(() => console.log('MongoDB connected successfully'))
// //   .catch(err => console.error('MongoDB connection error:', err));

// // // Add connection event listeners for better debugging
// // mongoose.connection.on('connected', () => {
// //   console.log('Mongoose connected to MongoDB');
// // });

// // mongoose.connection.on('error', err => {
// //   console.error('Mongoose connection error:', err);
// // });

// // mongoose.connection.on('disconnected', () => {
// //   console.log('Mongoose disconnected from MongoDB');
// // });

// // // API Endpoints
// // app.post('/api/recycling-request', async (req, res) => {
// //   try {
// //     const {
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime,
// //       collectionPreference,
// //       amount,
// //     } = req.body;
// //     console.log('Received request data:', req.body);

// //     // Validate required fields
// //     if (
// //       !name ||
// //       !email ||
// //       !contact ||
// //       !wasteType ||
// //       !quantity ||
// //       !community ||
// //       !pickupLocation ||
// //       !preferredPickupDateTime ||
// //       !collectionPreference ||
// //       amount === undefined
// //     ) {
// //       return res.status(400).json({ message: 'All fields are required' });
// //     }

// //     // Validate quantity
// //     const parsedQuantity = parseFloat(quantity);
// //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// //     }

// //     // Validate amount
// //     const parsedAmount = parseFloat(amount);
// //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// //     }

// //     // Validate wasteType
// //     const validWasteTypes = ['Organic', 'Glass', 'Plastic', 'Paper'];
// //     if (!validWasteTypes.includes(wasteType)) {
// //       return res.status(400).json({
// //         message: 'Invalid waste type. Must be Organic, Glass, Plastic, or Paper',
// //       });
// //     }

// //     // Validate collectionPreference
// //     const validCollectionPreferences = ['Delivery', 'Self-pickup'];
// //     if (!validCollectionPreferences.includes(collectionPreference)) {
// //       return res.status(400).json({
// //         message: 'Invalid collection preference. Must be Delivery or Self-pickup',
// //       });
// //     }

// //     // Validate contact (10 digits)
// //     if (!/^\d{10}$/.test(contact)) {
// //       return res.status(400).json({
// //         message: 'Contact number must be exactly 10 digits',
// //       });
// //     }

// //     // Save to user collection
// //     const newUserRequest = new RecyclingRequest({
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity: parsedQuantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime: new Date(preferredPickupDateTime),
// //       collectionPreference,
// //       amount: parsedAmount,
// //       status: 'Pending',
// //     });
// //     await newUserRequest.save();

// //     // Save to admin collection
// //     const newAdminRequest = new AdminRecyclingRequest({
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity: parsedQuantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime: new Date(preferredPickupDateTime),
// //       collectionPreference,
// //       status: 'Pending',
// //       userRequestId: newUserRequest._id,
// //       amount: parsedAmount,
// //     });
// //     await newAdminRequest.save();

// //     console.log('Saved user request:', newUserRequest);
// //     console.log('Saved admin request:', newAdminRequest);
// //     res.status(201).json({
// //       message: 'Recycling request submitted successfully',
// //       data: newUserRequest,
// //     });
// //   } catch (error) {
// //     console.error('Error submitting request:', error);
// //     if (error.name === 'ValidationError') {
// //       return res.status(400).json({
// //         message: 'Invalid data provided',
// //         errors: error.errors,
// //       });
// //     }
// //     res.status(500).json({
// //       message: 'Error submitting request',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Get All Recycling Requests for Users (My Orders page)
// // app.get('/api/recycling-requests', async (req, res) => {
// //   try {
// //     const { search } = req.query;
// //     let query = {};

// //     if (search) {
// //       const searchRegex = new RegExp(search, 'i');
// //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
// //       query.$or = [
// //         { name: searchRegex },
// //         { email: searchRegex },
// //         ...(isMongoId ? [{ _id: search }] : []),
// //       ];
// //     }

// //     const requests = await RecyclingRequest.find(query);
// //     console.log('Fetched user requests:', requests);
// //     res.status(200).json(requests);
// //   } catch (error) {
// //     console.error('Error fetching user requests:', error);
// //     res.status(500).json({
// //       message: 'Error fetching user requests',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Get All Recycling Requests for Admin (Recycling Requests page)
// // app.get('/api/admin/recycling-requests', async (req, res) => {
// //   try {
// //     const { search, startDate, endDate } = req.query;
// //     let query = {};

// //     if (search) {
// //       const searchRegex = new RegExp(search, 'i');
// //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
// //       query.$or = [
// //         { name: searchRegex },
// //         { email: searchRegex },
// //         ...(isMongoId ? [{ _id: search }] : []),
// //       ];
// //     }

// //     if (startDate && endDate) {
// //       query.preferredPickupDateTime = {
// //         $gte: new Date(startDate),
// //         $lte: new Date(`${endDate}T23:59:59`),
// //       };
// //     }

// //     const requests = await AdminRecyclingRequest.find(query);
// //     console.log('Fetched admin requests:', requests);
// //     res.status(200).json(requests);
// //   } catch (error) {
// //     console.error('Error fetching admin requests:', error);
// //     res.status(500).json({
// //       message: 'Error fetching admin requests',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Get a Single Recycling Request by ID for Users (My Order Details page)
// // app.get('/api/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     console.log('Fetching user request with ID:', id);
// //     const request = await RecyclingRequest.findById(id);
// //     console.log('Found user request:', request);
// //     if (!request) {
// //       return res.status(404).json({ message: 'Request not found' });
// //     }
// //     res.status(200).json(request);
// //   } catch (error) {
// //     console.error('Error fetching user request:', error);
// //     res.status(500).json({
// //       message: 'Error fetching user request',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Get a Single Recycling Request by ID for Admin (Recycling Order Details page)
// // app.get('/api/admin/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     console.log('Fetching admin request with ID:', id);
// //     const request = await AdminRecyclingRequest.findById(id);
// //     console.log('Found admin request:', request);
// //     if (!request) {
// //       return res.status(404).json({ message: 'Request not found' });
// //     }
// //     res.status(200).json(request);
// //   } catch (error) {
// //     console.error('Error fetching admin request:', error);
// //     res.status(500).json({
// //       message: 'Error fetching admin request',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Update a Recycling Request by ID for Users (UpdateOrder page)
// // app.put('/api/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const {
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime,
// //       collectionPreference,
// //       amount,
// //     } = req.body;
// //     console.log('Received update data for ID:', id, req.body);

// //     // Validate required fields
// //     if (
// //       !name ||
// //       !email ||
// //       !contact ||
// //       !wasteType ||
// //       !quantity ||
// //       !community ||
// //       !pickupLocation ||
// //       !preferredPickupDateTime ||
// //       !collectionPreference ||
// //       amount === undefined
// //     ) {
// //       return res.status(400).json({ message: 'All fields are required' });
// //     }

// //     // Validate quantity
// //     const parsedQuantity = parseFloat(quantity);
// //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// //       return res.status(400).json({
// //         message: 'Quantity must be a positive number',
// //       });
// //     }

// //     // Validate amount
// //     const parsedAmount = parseFloat(amount);
// //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// //       return res.status(400).json({
// //         message: 'Amount must be a non-negative number',
// //       });
// //     }

// //     // Validate wasteType
// //     const validWasteTypes = ['Organic', 'Glass', 'Plastic', 'Paper'];
// //     if (!validWasteTypes.includes(wasteType)) {
// //       return res.status(400).json({
// //         message: 'Invalid waste type. Must be Organic, Glass, Plastic, or Paper',
// //       });
// //     }

// //     // Validate contact (10 digits)
// //     if (!/^\d{10}$/.test(contact)) {
// //       return res.status(400).json({
// //         message: 'Contact number must be exactly 10 digits',
// //       });
// //     }

// //     // Update the user request
// //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// //       id,
// //       {
// //         name,
// //         email,
// //         contact,
// //         wasteType,
// //         quantity: parsedQuantity,
// //         community,
// //         pickupLocation,
// //         preferredPickupDateTime: new Date(preferredPickupDateTime),
// //         collectionPreference,
// //         amount: parsedAmount,
// //       },
// //       { new: true }
// //     );
// //     if (!updatedUserRequest) {
// //       return res.status(404).json({ message: 'User request not found' });
// //     }

// //     // Update the corresponding admin request
// //     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
// //       { userRequestId: id },
// //       {
// //         name,
// //         email,
// //         contact,
// //         wasteType,
// //         quantity: parsedQuantity,
// //         community,
// //         pickupLocation,
// //         preferredPickupDateTime: new Date(preferredPickupDateTime),
// //         collectionPreference,
// //         amount: parsedAmount,
// //       },
// //       { new: true }
// //     );
// //     if (!updatedAdminRequest) {
// //       console.warn('Corresponding admin request not found for userRequestId:', id);
// //     }

// //     console.log('Updated user request:', updatedUserRequest);
// //     console.log('Updated admin request:', updatedAdminRequest);
// //     res.status(200).json({
// //       message: 'Order updated successfully',
// //       data: updatedUserRequest,
// //     });
// //   } catch (error) {
// //     console.error('Error updating user request:', error);
// //     if (error.name === 'ValidationError') {
// //       return res.status(400).json({
// //         message: 'Invalid data provided',
// //         errors: error.errors,
// //       });
// //     }
// //     res.status(500).json({
// //       message: 'Error updating user request',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Update Status of a Recycling Request by ID for Admin (Update Status button)
// // app.put('/api/admin/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { status } = req.body;
// //     console.log('Received update status data for ID:', id, req.body);
// //     if (!status) {
// //       return res.status(400).json({ message: 'Status is required' });
// //     }

// //     // Validate status
// //     const validStatuses = ['Pending', 'Approved', 'Rejected'];
// //     if (!validStatuses.includes(status)) {
// //       return res.status(400).json({
// //         message: 'Invalid status. Must be Pending, Approved, or Rejected',
// //       });
// //     }

// //     // Update the admin request
// //     const updatedAdminRequest = await AdminRecyclingRequest.findByIdAndUpdate(
// //       id,
// //       { status },
// //       { new: true }
// //     );
// //     if (!updatedAdminRequest) {
// //       return res.status(404).json({ message: 'Admin request not found' });
// //     }

// //     // Update the corresponding user request using userRequestId
// //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// //       updatedAdminRequest.userRequestId,
// //       { status },
// //       { new: true }
// //     );
// //     if (!updatedUserRequest) {
// //       console.warn(
// //         'Corresponding user request not found for ID:',
// //         updatedAdminRequest.userRequestId
// //       );
// //     }

// //     console.log('Updated admin request:', updatedAdminRequest);
// //     console.log('Updated user request:', updatedUserRequest);
// //     res.status(200).json({
// //       message: 'Status updated successfully',
// //       data: updatedAdminRequest,
// //     });
// //   } catch (error) {
// //     console.error('Error updating admin request status:', error);
// //     res.status(500).json({
// //       message: 'Error updating admin request status',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Delete a Recycling Request by ID (Separate endpoints for user and admin)
// // app.delete('/api/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     console.log('Deleting user request with ID:', id);
// //     const deletedRequest = await RecyclingRequest.findByIdAndDelete(id);
// //     if (!deletedRequest) {
// //       return res.status(404).json({ message: 'Request not found' });
// //     }
// //     res.status(200).json({ message: 'User request deleted successfully' });
// //   } catch (error) {
// //     console.error('Error deleting user request:', error);
// //     res.status(500).json({
// //       message: 'Error deleting user request',
// //       error: error.message,
// //     });
// //   }
// // });

// // app.delete('/api/admin/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     console.log('Deleting admin request with ID:', id);
// //     const deletedRequest = await AdminRecyclingRequest.findByIdAndDelete(id);
// //     if (!deletedRequest) {
// //       return res.status(404).json({ message: 'Request not found' });
// //     }
// //     res.status(200).json({ message: 'Admin request deleted successfully' });
// //   } catch (error) {
// //     console.error('Error deleting admin request:', error);
// //     res.status(500).json({
// //       message: 'Error deleting admin request',
// //       error: error.message,
// //     });
// //   }
// // });

// // // Handle 404 errors (return JSON instead of HTML)
// // app.use((req, res) => {
// //   res.status(404).json({
// //     message: `Endpoint not found: ${req.method} ${req.url}`,
// //   });
// // });

// // // Start Server
// // app.listen(port, () => {
// //   console.log(`Server running on http://localhost:${port}`);
// // });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const RecyclingRequest = require('./models/RecyclingRequest');
const AdminRecyclingRequest = require('./models/AdminRecyclingRequest');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Add connection event listeners for better debugging
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// API Endpoints

app.post('/api/recycling-request', async (req, res) => {
  try {
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
    console.log('Received request data:', req.body);

    // Validate required fields
    if (
      !name ||
      !email ||
      !contact ||
      !wasteType ||
      !quantity ||
      !community ||
      !pickupLocation ||
      !preferredPickupDateTime ||
      !collectionPreference ||
      amount === undefined
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate quantity
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }

    // Validate wasteType
    const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
    if (!validWasteTypes.includes(wasteType)) {
      return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
    }

    // Validate collectionPreference
    const validCollectionPreferences = ['Delivery', 'Self-pickup'];
    if (!validCollectionPreferences.includes(collectionPreference)) {
      return res.status(400).json({ message: 'Invalid collection preference. Must be Delivery or Self-pickup' });
    }

    // Save to user collection
    const newUserRequest = new RecyclingRequest({
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
    await newUserRequest.save();

    // Save to admin collection
    const newAdminRequest = new AdminRecyclingRequest({
      name,
      email,
      contact,
      wasteType,
      quantity: parsedQuantity,
      community,
      pickupLocation,
      preferredPickupDateTime: new Date(preferredPickupDateTime),
      collectionPreference,
      status: 'Pending',
      userRequestId: newUserRequest._id,
      amount: parsedAmount,
    });
    await newAdminRequest.save();

    console.log('Saved user request:', newUserRequest);
    console.log('Saved admin request:', newAdminRequest);
    res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
  } catch (error) {
    console.error('Error submitting request:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
    }
    res.status(500).json({ message: 'Error submitting request', error: error.message });
  }
});

// Get All Recycling Requests for Users (My Orders page)
app.get('/api/recycling-requests', async (req, res) => {
  try {
    const { search } = req.query;
    /** @type {Object} */
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        ...(isMongoId ? [{ _id: search }] : []),
      ];
    }

    const requests = await RecyclingRequest.find(query);
    console.log('Fetched user requests:', requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
});

// Get All Recycling Requests for Admin (Recycling Requests page)
app.get('/api/admin/recycling-requests', async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    /** @type {Object} */
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        ...(isMongoId ? [{ _id: search }] : []),
      ];
    }

    if (startDate && endDate) {
      query.preferredPickupDateTime = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59`),
      };
    }

    const requests = await AdminRecyclingRequest.find(query);
    console.log('Fetched admin requests:', requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
  }
});

// Get a Single Recycling Request by ID for Users (My Order Details page)
app.get('/api/recycling-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching user request with ID:', id);
    const request = await RecyclingRequest.findById(id);
    console.log('Found user request:', request);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching user request:', error);
    res.status(500).json({ message: 'Error fetching user request', error: error.message });
  }
});

// Get a Single Recycling Request by ID for Admin (Recycling Order Details page)
app.get('/api/admin/recycling-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching admin request with ID:', id);
    const request = await AdminRecyclingRequest.findById(id);
    console.log('Found admin request:', request);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching admin request:', error);
    res.status(500).json({ message: 'Error fetching admin request', error: error.message });
  }
});

// Update a Recycling Request by ID for Users (UpdateOrder page)
app.put('/api/recycling-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
    console.log('Received update data for ID:', id, req.body);

    // Validate required fields
    if (
      !name ||
      !email ||
      !contact ||
      !wasteType ||
      !quantity ||
      !community ||
      !pickupLocation ||
      !preferredPickupDateTime ||
      !collectionPreference ||
      amount === undefined
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate quantity
    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }

    // Validate wasteType
    const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
    if (!validWasteTypes.includes(wasteType)) {
      return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
    }

    // Update the user request
    const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true }
    );
    if (!updatedUserRequest) {
      return res.status(404).json({ message: 'User request not found' });
    }

    // Update the corresponding admin request
    const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
      { userRequestId: id },
      {
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
      },
      { new: true }
    );
    if (!updatedAdminRequest) {
      console.warn('Corresponding admin request not found for userRequestId:', id);
    }

    console.log('Updated user request:', updatedUserRequest);
    console.log('Updated admin request:', updatedAdminRequest);
    res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
  } catch (error) {
    console.error('Error updating user request:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating user request', error: error.message });
  }
});

// Update Status of a Recycling Request by ID for Admin (Update Status button)
app.put('/api/admin/recycling-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('Received update status data for ID:', id, req.body);
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Update the admin request
    const updatedAdminRequest = await AdminRecyclingRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedAdminRequest) {
      return res.status(404).json({ message: 'Admin request not found' });
    }

    // Update the corresponding user request using userRequestId
    const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
      updatedAdminRequest.userRequestId,
      { status },
      { new: true }
    );
    if (!updatedUserRequest) {
      console.warn('Corresponding user request not found for ID:', updatedAdminRequest.userRequestId);
    }

    console.log('Updated admin request:', updatedAdminRequest);
    console.log('Updated user request:', updatedUserRequest);
    res.status(200).json({ message: 'Status updated successfully', data: updatedAdminRequest });
  } catch (error) {
    console.error('Error updating admin request status:', error);
    res.status(500).json({ message: 'Error updating admin request status', error: error.message });
  }
});

// Delete a Recycling Request by ID (Separate endpoints for user and admin)
app.delete('/api/recycling-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting user request with ID:', id);
    const deletedRequest = await RecyclingRequest.findByIdAndDelete(id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'User request deleted successfully' });
  } catch (error) {
    console.error('Error deleting user request:', error);
    res.status(500).json({ message: 'Error deleting user request', error: error.message });
  }
});

app.delete('/api/admin/recycling-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting admin request with ID:', id);
    const deletedRequest = await AdminRecyclingRequest.findByIdAndDelete(id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Admin request deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin request:', error);
    res.status(500).json({ message: 'Error deleting admin request', error: error.message });
  }
});

// Handle 404 errors (return JSON instead of HTML)
app.use((req, res) => {
  res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.url}` });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const RecyclingRequest = require('./models/RecyclingRequest');
// const AdminRecyclingRequest = require('./models/AdminRecyclingRequest');

// const app = express();
// const port = 5000;

// // Middleware
// app.use(express.json());
// app.use(cors({ origin: 'http://localhost:5173' }));

// // MongoDB Connection
// const mongoURI = process.env.MONGO_URI;

// mongoose.connect(mongoURI, {
//   serverSelectionTimeoutMS: 30000,
// })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Add connection event listeners for better debugging
// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('Mongoose connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Mongoose disconnected from MongoDB');
// });

// // API Endpoints

// app.post('/api/recycling-request', async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime,
//       collectionPreference,
//       amount,
//     } = req.body;
//     console.log('Received request data:', req.body);

//     // Validate required fields
//     if (
//       !name ||
//       !email ||
//       !contact ||
//       !wasteType ||
//       !quantity ||
//       !community ||
//       !pickupLocation ||
//       !preferredPickupDateTime ||
//       !collectionPreference ||
//       amount === undefined
//     ) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Validate quantity
//     const parsedQuantity = parseFloat(quantity);
//     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//       return res.status(400).json({ message: 'Quantity must be a positive number' });
//     }

//     // Validate amount
//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount) || parsedAmount < 0) {
//       return res.status(400).json({ message: 'Amount must be a non-negative number' });
//     }

//     // Validate wasteType
//     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
//     if (!validWasteTypes.includes(wasteType)) {
//       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
//     }

//     // Validate collectionPreference
//     const validCollectionPreferences = ['Delivery', 'Self-pickup'];
//     if (!validCollectionPreferences.includes(collectionPreference)) {
//       return res.status(400).json({ message: 'Invalid collection preference. Must be Delivery or Self-pickup' });
//     }

//     // Save to user collection
//     const newUserRequest = new RecyclingRequest({
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity: parsedQuantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime: new Date(preferredPickupDateTime), // Convert to Date
//       collectionPreference,
//       amount: parsedAmount,
//       status: 'Pending',
//     });
//     await newUserRequest.save();

//     // Save to admin collection
//     const newAdminRequest = new AdminRecyclingRequest({
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity: parsedQuantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime, // Store as string for AdminRecyclingRequest
//       collectionPreference,
//       status: 'Pending',
//       userRequestId: newUserRequest._id,
//     });
//     await newAdminRequest.save();

//     console.log('Saved user request:', newUserRequest);
//     console.log('Saved admin request:', newAdminRequest);
//     res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
//   } catch (error) {
//     console.error('Error submitting request:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
//     }
//     res.status(500).json({ message: 'Error submitting request', error: error.message });
//   }
// });

// app.get('/api/recycling-requests', async (req, res) => {
//   try {
//     const requests = await RecyclingRequest.find();
//     console.log('Fetched user requests:', requests);
//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching user requests:', error);
//     res.status(500).json({ message: 'Error fetching user requests', error: error.message });
//   }
// });

// // Get All Recycling Requests for Admin (Recycling Requests page)
// app.get('/api/admin/recycling-requests', async (req, res) => {
//   try {
//     const requests = await AdminRecyclingRequest.find();
//     console.log('Fetched admin requests:', requests);
//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching admin requests:', error);
//     res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
//   }
// });

// // Get a Single Recycling Request by ID for Users (My Order Details page)
// app.get('/api/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Fetching user request with ID:', id);
//     const request = await RecyclingRequest.findById(id);
//     console.log('Found user request:', request);
//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json(request);
//   } catch (error) {
//     console.error('Error fetching user request:', error);
//     res.status(500).json({ message: 'Error fetching user request', error: error.message });
//   }
// });

// // Get a Single Recycling Request by ID for Admin (Recycling Order Details page)
// app.get('/api/admin/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Fetching admin request with ID:', id);
//     const request = await AdminRecyclingRequest.findById(id);
//     console.log('Found admin request:', request);
//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json(request);
//   } catch (error) {
//     console.error('Error fetching admin request:', error);
//     res.status(500).json({ message: 'Error fetching admin request', error: error.message });
//   }
// });

// // Update a Recycling Request by ID for Users (UpdateOrder page)
// // app.put('/api/recycling-request/:id', async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { name, email, contact, wasteType, quantity, community, pickupLocation, preferredPickupDateTime, collectionPreference } = req.body;
// //     console.log('Received update data for ID:', id, req.body);
// //     if (!name || !email || !contact || !wasteType || !quantity || !community || !pickupLocation || !preferredPickupDateTime || !collectionPreference) {
// //       return res.status(400).json({ message: 'All fields are required' });
// //     }

// //     // Update the user request
// //     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
// //       id,
// //       { 
// //         name, 
// //         email, 
// //         contact, 
// //         wasteType, 
// //         quantity: Number(quantity), 
// //         community, 
// //         pickupLocation, 
// //         preferredPickupDateTime, 
// //         collectionPreference 
// //       },
// //       { new: true }
// //     );
// //     if (!updatedUserRequest) {
// //       return res.status(404).json({ message: 'User request not found' });
// //     }

// //     // Find and update the corresponding admin request using userRequestId
// //     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
// //       { userRequestId: id },
// //       { 
// //         name, 
// //         email, 
// //         contact, 
// //         wasteType, 
// //         quantity: Number(quantity), 
// //         community, 
// //         pickupLocation, 
// //         preferredPickupDateTime, 
// //         collectionPreference 
// //       },
// //       { new: true }
// //     );
// //     if (!updatedAdminRequest) {
// //       console.warn('Corresponding admin request not found for userRequestId:', id);
// //     }

// //     console.log('Updated user request:', updatedUserRequest);
// //     console.log('Updated admin request:', updatedAdminRequest);
// //     res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
// //   } catch (error) {
// //     console.error('Error updating user request:', error);
// //     res.status(500).json({ message: 'Error updating user request', error: error.message });
// //   }
// // });

// app.put('/api/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime,
//       collectionPreference,
//       amount,
//     } = req.body;
//     console.log('Received update data for ID:', id, req.body);

//     // Validate required fields
//     if (
//       !name ||
//       !email ||
//       !contact ||
//       !wasteType ||
//       !quantity ||
//       !community ||
//       !pickupLocation ||
//       !preferredPickupDateTime ||
//       !collectionPreference ||
//       amount === undefined
//     ) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Validate quantity
//     const parsedQuantity = parseFloat(quantity);
//     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//       return res.status(400).json({ message: 'Quantity must be a positive number' });
//     }

//     // Validate amount
//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount) || parsedAmount < 0) {
//       return res.status(400).json({ message: 'Amount must be a non-negative number' });
//     }

//     // Validate wasteType
//     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
//     if (!validWasteTypes.includes(wasteType)) {
//       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
//     }

//     // Update the user request
//     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
//       id,
//       {
//         name,
//         email,
//         contact,
//         wasteType,
//         quantity: parsedQuantity,
//         community,
//         pickupLocation,
//         preferredPickupDateTime: new Date(preferredPickupDateTime),
//         collectionPreference,
//         amount: parsedAmount,
//       },
//       { new: true }
//     );
//     if (!updatedUserRequest) {
//       return res.status(404).json({ message: 'User request not found' });
//     }

//     // Update the corresponding admin request
//     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
//       { userRequestId: id },
//       {
//         name,
//         email,
//         contact,
//         wasteType,
//         quantity: parsedQuantity,
//         community,
//         pickupLocation,
//         preferredPickupDateTime,
//         collectionPreference,
//       },
//       { new: true }
//     );
//     if (!updatedAdminRequest) {
//       console.warn('Corresponding admin request not found for userRequestId:', id);
//     }

//     console.log('Updated user request:', updatedUserRequest);
//     console.log('Updated admin request:', updatedAdminRequest);
//     res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
//   } catch (error) {
//     console.error('Error updating user request:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
//     }
//     res.status(500).json({ message: 'Error updating user request', error: error.message });
//   }
// });

// // Update Status of a Recycling Request by ID for Admin (Update Status button)
// app.put('/api/admin/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     console.log('Received update status data for ID:', id, req.body);
//     if (!status) {
//       return res.status(400).json({ message: 'Status is required' });
//     }

//     // Update the admin request
//     const updatedAdminRequest = await AdminRecyclingRequest.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );
//     if (!updatedAdminRequest) {
//       return res.status(404).json({ message: 'Admin request not found' });
//     }

//     // Update the corresponding user request using userRequestId
//     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
//       updatedAdminRequest.userRequestId,
//       { status },
//       { new: true }
//     );
//     if (!updatedUserRequest) {
//       console.warn('Corresponding user request not found for ID:', updatedAdminRequest.userRequestId);
//     }

//     console.log('Updated admin request:', updatedAdminRequest);
//     console.log('Updated user request:', updatedUserRequest);
//     res.status(200).json({ message: 'Status updated successfully', data: updatedAdminRequest });
//   } catch (error) {
//     console.error('Error updating admin request status:', error);
//     res.status(500).json({ message: 'Error updating admin request status', error: error.message });
//   }
// });

// // Delete a Recycling Request by ID (Separate endpoints for user and admin)
// app.delete('/api/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Deleting user request with ID:', id);
//     const deletedRequest = await RecyclingRequest.findByIdAndDelete(id);
//     if (!deletedRequest) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json({ message: 'User request deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user request:', error);
//     res.status(500).json({ message: 'Error deleting user request', error: error.message });
//   }
// });

// app.delete('/api/admin/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Deleting admin request with ID:', id);
//     const deletedRequest = await AdminRecyclingRequest.findByIdAndDelete(id);
//     if (!deletedRequest) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json({ message: 'Admin request deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting admin request:', error);
//     res.status(500).json({ message: 'Error deleting admin request', error: error.message });
//   }
// });

// // Handle 404 errors (return JSON instead of HTML)
// app.use((req, res) => {
//   res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.url}` });
// });

// // Start Server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });













// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const RecyclingRequest = require('./models/RecyclingRequest');
// const AdminRecyclingRequest = require('./models/AdminRecyclingRequest');

// const app = express();
// const port = 5000;

// // Middleware
// app.use(express.json());
// app.use(cors({ origin: 'http://localhost:5173' }));

// // MongoDB Connection
// const mongoURI = process.env.MONGO_URI;

// mongoose.connect(mongoURI, {
//   serverSelectionTimeoutMS: 30000,
// })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Add connection event listeners for better debugging
// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('Mongoose connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Mongoose disconnected from MongoDB');
// });

// // API Endpoints

// // app.post('/api/recycling-request', async (req, res) => {
// //   try {
// //     const {
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime,
// //       collectionPreference,
// //       amount,
// //     } = req.body;
// //     console.log('Received request data:', req.body);

// //     // Validate required fields
// //     if (
// //       !name ||
// //       !email ||
// //       !contact ||
// //       !wasteType ||
// //       !quantity ||
// //       !community ||
// //       !pickupLocation ||
// //       !preferredPickupDateTime ||
// //       !collectionPreference ||
// //       amount === undefined
// //     ) {
// //       return res.status(400).json({ message: 'All fields are required' });
// //     }

// //     // Validate quantity
// //     const parsedQuantity = parseFloat(quantity);
// //     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
// //       return res.status(400).json({ message: 'Quantity must be a positive number' });
// //     }

// //     // Validate amount
// //     const parsedAmount = parseFloat(amount);
// //     if (isNaN(parsedAmount) || parsedAmount < 0) {
// //       return res.status(400).json({ message: 'Amount must be a non-negative number' });
// //     }

// //     // Validate wasteType
// //     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
// //     if (!validWasteTypes.includes(wasteType)) {
// //       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
// //     }

// //     // Validate collectionPreference
// //     const validCollectionPreferences = ['Delivery', 'Self-pickup'];
// //     if (!validCollectionPreferences.includes(collectionPreference)) {
// //       return res.status(400).json({ message: 'Invalid collection preference. Must be Delivery or Self-pickup' });
// //     }

// //     // Save to user collection
// //     const newUserRequest = new RecyclingRequest({
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity: parsedQuantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime: new Date(preferredPickupDateTime),
// //       collectionPreference,
// //       amount: parsedAmount,
// //       status: 'Pending',
// //     });
// //     await newUserRequest.save();

// //     // Save to admin collection
// //     const newAdminRequest = new AdminRecyclingRequest({
// //       name,
// //       email,
// //       contact,
// //       wasteType,
// //       quantity: parsedQuantity,
// //       community,
// //       pickupLocation,
// //       preferredPickupDateTime,
// //       collectionPreference,
// //       status: 'Pending',
// //       userRequestId: newUserRequest._id,
// //     });
// //     await newAdminRequest.save();

// //     console.log('Saved user request:', newUserRequest);
// //     console.log('Saved admin request:', newAdminRequest);
// //     res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
// //   } catch (error) {
// //     console.error('Error submitting request:', error);
// //     if (error.name === 'ValidationError') {
// //       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
// //     }
// //     res.status(500).json({ message: 'Error submitting request', error: error.message });
// //   }
// // });

// // // Get All Recycling Requests for Users (My Orders page)
// // app.get('/api/recycling-requests', async (req, res) => {
// //   try {
// //     const { search } = req.query;
// //     let query = {};

// //     if (search) {
// //       const searchRegex = new RegExp(search, 'i');
// //       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search); // Check if search is a valid MongoDB ObjectId
// //       query = {
// //         $or: [
// //           { name: searchRegex },
// //           { email: searchRegex },
// //           ...(isMongoId ? [{ _id: search }] : []),
// //         ],
// //       };
// //     }

// //     const requests = await RecyclingRequest.find(query);
// //     console.log('Fetched user requests:', requests);
// //     res.status(200).json(requests);
// //   } catch (error) {
// //     console.error('Error fetching user requests:', error);
// //     res.status(500).json({ message: 'Error fetching user requests', error: error.message });
// //   }
// // });

// app.post('/api/recycling-request', async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime,
//       collectionPreference,
//       amount,
//     } = req.body;
//     console.log('Received request data:', req.body);

//     // Validate required fields
//     if (
//       !name ||
//       !email ||
//       !contact ||
//       !wasteType ||
//       !quantity ||
//       !community ||
//       !pickupLocation ||
//       !preferredPickupDateTime ||
//       !collectionPreference ||
//       amount === undefined
//     ) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Validate quantity
//     const parsedQuantity = parseFloat(quantity);
//     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//       return res.status(400).json({ message: 'Quantity must be a positive number' });
//     }

//     // Validate amount
//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount) || parsedAmount < 0) {
//       return res.status(400).json({ message: 'Amount must be a non-negative number' });
//     }

//     // Validate wasteType
//     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
//     if (!validWasteTypes.includes(wasteType)) {
//       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
//     }

//     // Generate orderId
//     const lastRequest = await RecyclingRequest.findOne().sort({ createdAt: -1 });
//     const newOrderId = lastRequest ? String(Number(lastRequest.orderId) + 1).padStart(3, '0') : '001';

//     // Save to user collection
//     const newUserRequest = new RecyclingRequest({
//       orderId: newOrderId,
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity: parsedQuantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime: new Date(preferredPickupDateTime),
//       collectionPreference,
//       amount: parsedAmount,
//       status: 'Pending',
//     });
//     await newUserRequest.save();

//     // Save to admin collection
//     const newAdminRequest = new AdminRecyclingRequest({
//       orderId: newOrderId,
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity: parsedQuantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime,
//       collectionPreference,
//       status: 'Pending',
//       userRequestId: newUserRequest._id,
//     });
//     await newAdminRequest.save();

//     console.log('Saved user request:', newUserRequest);
//     console.log('Saved admin request:', newAdminRequest);
//     res.status(201).json({ message: 'Recycling request submitted successfully', data: newUserRequest });
//   } catch (error) {
//     console.error('Error submitting request:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
//     }
//     res.status(500).json({ message: 'Error submitting request', error: error.message });
//   }
// });



// app.get('/api/recycling-requests', async (req, res) => {
//   try {
//     const { search } = req.query;
//     let query = {};

//     if (search) {
//       const searchRegex = new RegExp(search, 'i');
//       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
//       query = {
//         $or: [
//           { name: searchRegex },
//           { email: searchRegex },
//           { orderId: search }, // Exact match for orderId
//           ...(isMongoId ? [{ _id: search }] : []),
//         ],
//       };
//     }

//     const requests = await RecyclingRequest.find(query);
//     console.log('Fetched user requests:', requests);
//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching user requests:', error);
//     res.status(500).json({ message: 'Error fetching user requests', error: error.message });
//   }
// });

// app.get('/api/admin/recycling-requests', async (req, res) => {
//   try {
//     const { search } = req.query;
//     let query = {};

//     if (search) {
//       const searchRegex = new RegExp(search, 'i');
//       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
//       query = {
//         $or: [
//           { name: searchRegex },
//           { email: searchRegex },
//           { orderId: search },
//           ...(isMongoId ? [{ _id: search }] : []),
//         ],
//       };
//     }

//     const requests = await AdminRecyclingRequest.find(query);
//     console.log('Fetched admin requests:', requests);
//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching admin requests:', error);
//     res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
//   }
// });

// // Get a Single Recycling Request by ID for Users (My Order Details page)
// app.get('/api/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Fetching user request with ID:', id);
//     const request = await RecyclingRequest.findById(id);
//     console.log('Found user request:', request);
//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json(request);
//   } catch (error) {
//     console.error('Error fetching user request:', error);
//     res.status(500).json({ message: 'Error fetching user request', error: error.message });
//   }
// });

// // Get a Single Recycling Request by ID for Admin (Recycling Order Details page)
// app.get('/api/admin/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Fetching admin request with ID:', id);
//     const request = await AdminRecyclingRequest.findById(id);
//     console.log('Found admin request:', request);
//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json(request);
//   } catch (error) {
//     console.error('Error fetching admin request:', error);
//     res.status(500).json({ message: 'Error fetching admin request', error: error.message });
//   }
// });

// // Update a Recycling Request by ID for Users (UpdateOrder page)
// app.put('/api/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       email,
//       contact,
//       wasteType,
//       quantity,
//       community,
//       pickupLocation,
//       preferredPickupDateTime,
//       collectionPreference,
//       amount,
//     } = req.body;
//     console.log('Received update data for ID:', id, req.body);

//     // Validate required fields
//     if (
//       !name ||
//       !email ||
//       !contact ||
//       !wasteType ||
//       !quantity ||
//       !community ||
//       !pickupLocation ||
//       !preferredPickupDateTime ||
//       !collectionPreference ||
//       amount === undefined
//     ) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Validate quantity
//     const parsedQuantity = parseFloat(quantity);
//     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//       return res.status(400).json({ message: 'Quantity must be a positive number' });
//     }

//     // Validate amount
//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount) || parsedAmount < 0) {
//       return res.status(400).json({ message: 'Amount must be a non-negative number' });
//     }

//     // Validate wasteType
//     const validWasteTypes = ['Glass', 'Plastic', 'Paper'];
//     if (!validWasteTypes.includes(wasteType)) {
//       return res.status(400).json({ message: 'Invalid waste type. Must be Glass, Plastic, or Paper' });
//     }

//     // Update the user request
//     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
//       id,
//       {
//         name,
//         email,
//         contact,
//         wasteType,
//         quantity: parsedQuantity,
//         community,
//         pickupLocation,
//         preferredPickupDateTime: new Date(preferredPickupDateTime),
//         collectionPreference,
//         amount: parsedAmount,
//       },
//       { new: true }
//     );
//     if (!updatedUserRequest) {
//       return res.status(404).json({ message: 'User request not found' });
//     }

//     // Update the corresponding admin request
//     const updatedAdminRequest = await AdminRecyclingRequest.findOneAndUpdate(
//       { userRequestId: id },
//       {
//         name,
//         email,
//         contact,
//         wasteType,
//         quantity: parsedQuantity,
//         community,
//         pickupLocation,
//         preferredPickupDateTime,
//         collectionPreference,
//       },
//       { new: true }
//     );
//     if (!updatedAdminRequest) {
//       console.warn('Corresponding admin request not found for userRequestId:', id);
//     }

//     console.log('Updated user request:', updatedUserRequest);
//     console.log('Updated admin request:', updatedAdminRequest);
//     res.status(200).json({ message: 'Order updated successfully', data: updatedUserRequest });
//   } catch (error) {
//     console.error('Error updating user request:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: 'Invalid data provided', errors: error.errors });
//     }
//     res.status(500).json({ message: 'Error updating user request', error: error.message });
//   }
// });

// // Update Status of a Recycling Request by ID for Admin (Update Status button)
// app.put('/api/admin/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     console.log('Received update status data for ID:', id, req.body);
//     if (!status) {
//       return res.status(400).json({ message: 'Status is required' });
//     }

//     // Update the admin request
//     const updatedAdminRequest = await AdminRecyclingRequest.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );
//     if (!updatedAdminRequest) {
//       return res.status(404).json({ message: 'Admin request not found' });
//     }

//     // Update the corresponding user request using userRequestId
//     const updatedUserRequest = await RecyclingRequest.findByIdAndUpdate(
//       updatedAdminRequest.userRequestId,
//       { status },
//       { new: true }
//     );
//     if (!updatedUserRequest) {
//       console.warn('Corresponding user request not found for ID:', updatedAdminRequest.userRequestId);
//     }

//     console.log('Updated admin request:', updatedAdminRequest);
//     console.log('Updated user request:', updatedUserRequest);
//     res.status(200).json({ message: 'Status updated successfully', data: updatedAdminRequest });
//   } catch (error) {
//     console.error('Error updating admin request status:', error);
//     res.status(500).json({ message: 'Error updating admin request status', error: error.message });
//   }
// });

// // Delete a Recycling Request by ID (Separate endpoints for user and admin)
// app.delete('/api/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Deleting user request with ID:', id);
//     const deletedRequest = await RecyclingRequest.findByIdAndDelete(id);
//     if (!deletedRequest) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json({ message: 'User request deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user request:', error);
//     res.status(500).json({ message: 'Error deleting user request', error: error.message });
//   }
// });

// app.delete('/api/admin/recycling-request/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log('Deleting admin request with ID:', id);
//     const deletedRequest = await AdminRecyclingRequest.findByIdAndDelete(id);
//     if (!deletedRequest) {
//       return res.status(404).json({ message: 'Request not found' });
//     }
//     res.status(200).json({ message: 'Admin request deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting admin request:', error);
//     res.status(500).json({ message: 'Error deleting admin request', error: error.message });
//   }
// });

// // Handle 404 errors (return JSON instead of HTML)
// app.use((req, res) => {
//   res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.url}` });
// });

// // Start Server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// // Get All Recycling Requests for Admin (Recycling Requests page)
// app.get('/api/admin/recycling-requests', async (req, res) => {
//   try {
//     const { search } = req.query;
//     let query = {};

//     if (search) {
//       const searchRegex = new RegExp(search, 'i');
//       const isMongoId = /^[0-9a-fA-F]{24}$/.test(search);
//       query = {
//         $or: [
//           { name: searchRegex },
//           { email: searchRegex },
//           ...(isMongoId ? [{ _id: search }] : []),
//         ],
//       };
//     }

//     const requests = await AdminRecyclingRequest.find(query);
//     console.log('Fetched admin requests:', requests);
//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching admin requests:', error);
//     res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
//   }
// });