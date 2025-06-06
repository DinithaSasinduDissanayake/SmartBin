const mongoose = require('mongoose');

const adminRecyclingRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  wasteType: { type: String, required: true },
  quantity: { type: Number, required: true },
  community: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  preferredPickupDateTime: { type: String, required: true },
  collectionPreference: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  userRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecyclingRequest', required: true },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model('AdminRecyclingRequest', adminRecyclingRequestSchema);