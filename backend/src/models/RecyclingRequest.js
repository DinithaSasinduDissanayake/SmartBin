// const mongoose = require('mongoose');

// const recyclingSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   contact: { type: String, required: true },
//   wasteType: { type: String, required: true, enum: ['Glass', 'Plastic', 'Paper'] },
//   quantity: { type: Number, required: true },
//   community: { type: String, required: true },
//   pickupLocation: { type: String, required: true },
//   preferredPickupDateTime: { type: Date, required: true },
//   collectionPreference: { type: String, required: true, enum: ['Delivery', 'Self-pickup'] },
//   amount: { type: Number, required: true },
//   status: { type: String, default: 'Pending' },
//   createdAt: { type: Date, default: Date.now }
// }, { collection: 'recyclingrequests' }); // Specify collection name

// module.exports = mongoose.model('RecyclingRequest', recyclingSchema);


const mongoose = require('mongoose');

const recyclingRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  wasteType: { type: String, required: true, enum: ['Glass', 'Plastic', 'Paper'] },
  quantity: { type: Number, required: true },
  community: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  preferredPickupDateTime: { type: Date, required: true },
  collectionPreference: { type: String, required: true, enum: ['Delivery', 'Self-pickup'] },
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected', 'Completed'] },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model('RecyclingRequest', recyclingRequestSchema);