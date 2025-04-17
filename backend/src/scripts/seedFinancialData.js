/**
 * Seed Financial Data Script
 * 
 * This script populates the database with realistic financial data for the SmartBin application.
 * It creates:
 * 1. Subscription plans (if they don't exist)
 * 2. Subscription records for users
 * 3. Payment transactions
 * 4. Expense records
 * 
 * Use for development, testing, and demo purposes.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import models
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

// Utility function to generate a random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Utility function to generate random number between min and max
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Utility function to get a random element from an array
const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Utility function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Utility function to add months to a date
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Main seeding function
const seedFinancialData = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sasindu10:12345@smartbincluster.ij7fd.mongodb.net/smartbin?retryWrites=true&w=majority&appName=SmartBinCluster';
    
    console.log('Using MongoDB connection from environment');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get financial manager user (needed for expense creation)
    const financialManager = await User.findOne({ role: 'financial_manager' });
    if (!financialManager) {
      console.log('No financial manager found. Please run createTestUsers.js first.');
      return;
    }

    // Get all users (residents/customers)
    const users = await User.find({ role: { $ne: 'admin', $ne: 'financial_manager', $ne: 'staff' } });
    if (users.length === 0) {
      // Create some test customer users if none exist
      console.log('No customer users found. Creating some test customers...');
      
      const customerNames = [
        'John Smith', 'Emma Wilson', 'Michael Brown', 'Sophia Davis', 
        'William Johnson', 'Olivia Taylor', 'James Miller', 'Ava Anderson',
        'Robert Thomas', 'Isabella Jackson', 'Daniel White', 'Mia Harris',
        'David Martinez', 'Charlotte Thompson', 'Joseph Garcia', 'Amelia Robinson'
      ];
      
      for (let i = 0; i < customerNames.length; i++) {
        const newUser = new User({
          name: customerNames[i],
          email: customerNames[i].toLowerCase().replace(' ', '.') + '@example.com',
          password: '$2a$10$XA9UJn3AJlszUVCjsxAN1uhkZ8qzBqOn9jBp0ZBOg5AfU9Hgu5P5W', // Password123!
          role: 'Resident/Garbage_Buyer',
          createdAt: randomDate(new Date(2024, 0, 1), new Date())
        });
        
        await newUser.save();
        console.log(`Created test customer: ${newUser.name}`);
      }
      
      // Fetch the newly created users
      users.push(...await User.find({ role: 'Resident/Garbage_Buyer' }));
    }

    // 1. Create subscription plans if they don't exist
    console.log('Setting up subscription plans...');
    
    const subscriptionPlans = [
      {
        name: 'Basic',
        price: '49.99',
        description: 'Basic waste collection service with weekly pickup and app access.',
        duration: 'Monthly'
      },
      {
        name: 'Standard',
        price: '79.99',
        description: 'Enhanced service with twice-weekly pickup, recycling options, and advanced app features.',
        duration: 'Monthly'
      },
      {
        name: 'Premium',
        price: '99.99',
        description: 'Premium service with unlimited pickup, priority service, recycling and composting options, and full app features.',
        duration: 'Monthly'
      },
      {
        name: 'Business',
        price: '199.99',
        description: 'Comprehensive waste management solution for small to medium businesses with daily collection and dedicated support.',
        duration: 'Monthly'
      }
    ];
    
    // Create plans if they don't exist
    for (const plan of subscriptionPlans) {
      const existingPlan = await SubscriptionPlan.findOne({ name: plan.name });
      
      if (existingPlan) {
        console.log(`Subscription plan ${plan.name} already exists.`);
      } else {
        await SubscriptionPlan.create(plan);
        console.log(`Created subscription plan: ${plan.name}`);
      }
    }
    
    // Get all plans after creation
    const allPlans = await SubscriptionPlan.find({});
    
    // 2. Create user subscriptions
    console.log('Creating user subscriptions...');
    
    // Get current date for subscription calculations
    const currentDate = new Date(); // Use the actual current date
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
    
    // Clear existing user subscriptions 
    await UserSubscription.deleteMany({});
    
    // Create realistic distribution of plans among users
    for (const user of users) {
      // Randomly select a plan with weighted distribution
      // Premium and Business plans are less common
      const planWeights = [0.4, 0.3, 0.2, 0.1]; // Probabilities for Basic, Standard, Premium, Business
      const randomValue = Math.random();
      let cumulativeProbability = 0;
      let selectedPlanIndex = 0;
      
      for (let i = 0; i < planWeights.length; i++) {
        cumulativeProbability += planWeights[i];
        if (randomValue <= cumulativeProbability) {
          selectedPlanIndex = i;
          break;
        }
      }
      
      const selectedPlan = allPlans[selectedPlanIndex];
      
      // Random start date between 6 months ago and now
      const startDate = randomDate(sixMonthsAgo, currentDate);
      
      // Determine duration based on plan
      let durationInMonths = 1; // Default monthly
      
      if (Math.random() > 0.7) {
        // 30% chance of longer subscription
        if (selectedPlan.duration === 'Monthly') {
          // Some users choose longer terms for monthly plans
          durationInMonths = randomElement([3, 6, 12]);
        }
      }
      
      // Calculate end and next billing dates
      const endDate = addMonths(startDate, durationInMonths);
      let nextBillingDate = new Date(startDate);
      
      // If the subscription would have already ended, create a renewed one
      if (endDate < currentDate) {
        // This is a renewal
        const renewalCycles = Math.floor((currentDate - startDate) / (durationInMonths * 30 * 24 * 60 * 60 * 1000)) + 1;
        nextBillingDate = addMonths(startDate, durationInMonths * renewalCycles);
      }
      
      // Create the subscription
      const subscription = new UserSubscription({
        user: user._id,
        subscriptionPlan: selectedPlan._id,
        startDate,
        endDate: addMonths(nextBillingDate, durationInMonths),
        status: 'active',
        autoRenew: Math.random() > 0.1, // 90% have auto-renew on
        lastBillingDate: startDate,
        nextBillingDate
      });
      
      await subscription.save();
      console.log(`Created subscription for user ${user.name}: ${selectedPlan.name} plan`);
      
      // Update subscription count on the plan
      await SubscriptionPlan.findByIdAndUpdate(
        selectedPlan._id, 
        { $inc: { subscriberCount: 1 } }
      );
    }
    
    // 3. Create payment records
    console.log('Generating payment history...');
    
    // Clear existing payments
    await Payment.deleteMany({});
    
    // Get all active subscriptions
    const activeSubscriptions = await UserSubscription.find({ status: 'active' })
      .populate('user')
      .populate('subscriptionPlan');
    
    // Generate payment history for each active subscription
    for (const subscription of activeSubscriptions) {
      // Calculate how many payment cycles have occurred up to the current date
      const startDate = new Date(subscription.startDate);
      // Ensure we cover cycles potentially ending *in* the current month
      const monthsElapsed = Math.max(0, Math.floor((currentDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))); // Approximate months
      const paymentCyclesToGenerate = monthsElapsed + 1; // Generate for current cycle too

      // Generate a payment for each billing cycle that has occurred or is current
      for (let i = 0; i < paymentCyclesToGenerate; i++) {
        const paymentDate = addMonths(startDate, i);

        // Only create payments up to the current date
        if (paymentDate > currentDate) continue;
        
        // Determine payment amount based on plan price
        const price = parseFloat(subscription.subscriptionPlan.price);
        if (isNaN(price)) {
          console.error(`Invalid price for subscription plan: ${subscription.subscriptionPlan.name}`);
          continue; // Skip this payment if the price is invalid
        }
        const amount = price;
        
        // Generate some overdue and pending payments (10% chance)
        const status = Math.random() > 0.9 
          ? randomElement(['pending', 'failed']) 
          : 'completed';
        
        // Create payment record
        const payment = new Payment({
          user: subscription.user._id,
          amount,
          description: `${subscription.subscriptionPlan.name} Plan - ${subscription.subscriptionPlan.duration}`,
          paymentDate,
          status,
          paymentMethod: randomElement(['credit_card', 'debit_card', 'bank_transfer', 'paypal']),
          subscriptionPlan: subscription.subscriptionPlan._id
        });
        
        await payment.save();
      }
      
      console.log(`Created payment history for ${subscription.user.name}`);
    }
    
    // 4. Create some one-time payments not related to subscriptions
    const oneTimePaymentDescriptions = [
      'One-time bin purchase',
      'Extra collection service',
      'Recycling equipment',
      'Special waste disposal',
      'Composting kit'
    ];
    
    for (let i = 0; i < 25; i++) {
      const randomUser = randomElement(users);
      const paymentDate = randomDate(sixMonthsAgo, currentDate);
      const amount = randomNumber(30, 200);
      
      const payment = new Payment({
        user: randomUser._id,
        amount,
        description: randomElement(oneTimePaymentDescriptions),
        paymentDate,
        status: randomElement(['completed', 'completed', 'completed', 'completed', 'pending']), // 80% completed
        paymentMethod: randomElement(['credit_card', 'debit_card', 'bank_transfer', 'paypal']),
        subscriptionPlan: null
      });
      
      await payment.save();
    }
    
    console.log('Created one-time payments');
    
    // 5. Create expense records
    console.log('Generating expense records...');
    
    // Clear existing expenses
    await Expense.deleteMany({});
    
    // Define expense categories and their relative frequencies and ranges
    const expenseCategories = [
      { category: 'fuel', frequency: 0.15, min: 200, max: 800 },
      { category: 'maintenance', frequency: 0.15, min: 100, max: 1000 },
      { category: 'salaries', frequency: 0.3, min: 1500, max: 5000 },
      { category: 'utilities', frequency: 0.1, min: 300, max: 800 },
      { category: 'equipment', frequency: 0.1, min: 200, max: 2000 },
      { category: 'office', frequency: 0.05, min: 50, max: 300 },
      { category: 'rent', frequency: 0.05, min: 1000, max: 3000 },
      { category: 'marketing', frequency: 0.05, min: 200, max: 1500 },
      { category: 'insurance', frequency: 0.03, min: 500, max: 2000 },
      { category: 'taxes', frequency: 0.02, min: 500, max: 5000 },
    ];
    
    // Expense descriptions for each category
    const expenseDescriptions = {
      fuel: ['Vehicle refueling', 'Truck fleet fuel', 'Collection vehicle diesel', 'Transportation fuel'],
      maintenance: ['Vehicle maintenance', 'Equipment repair', 'Bin repair services', 'Facility maintenance', 'Machinery servicing'],
      salaries: ['Staff payroll', 'Employee benefits', 'Contractor payments', 'Overtime payments', 'Management salaries'],
      utilities: ['Electricity bill', 'Water services', 'Internet and phone', 'Gas bill', 'Waste facility utilities'],
      equipment: ['New sorting equipment', 'Replacement bins', 'Office equipment', 'Safety equipment', 'Processing machinery'],
      office: ['Office supplies', 'Stationery', 'Cleaning supplies', 'Break room supplies', 'Small equipment'],
      rent: ['Office space rent', 'Warehouse rental', 'Storage facility', 'Equipment leasing', 'Temporary space rental'],
      marketing: ['Promotional materials', 'Digital advertising', 'Community outreach', 'Website maintenance', 'Marketing campaign'],
      insurance: ['Vehicle insurance', 'Liability coverage', 'Property insurance', 'Worker compensation', 'Business insurance'],
      taxes: ['Property tax', 'Business tax payment', 'Regulatory fees', 'Environmental compliance fees', 'Local taxes']
    };
    
    // Generate monthly expenses for each category for the past 6 months up to the current month
    const firstExpenseMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1); // Start 5 months before the current month

    for (let monthOffset = 0; monthOffset <= 5; monthOffset++) {
      const targetMonthDate = addMonths(firstExpenseMonth, monthOffset);
      // Ensure we don't generate for future months beyond the current one
      if (targetMonthDate.getFullYear() > currentDate.getFullYear() || 
          (targetMonthDate.getFullYear() === currentDate.getFullYear() && targetMonthDate.getMonth() > currentDate.getMonth())) {
          continue;
      }

      // For each expense category
      for (const expenseCat of expenseCategories) {
        // Create 1-3 expenses per category per month
        const numExpenses = randomNumber(1, 3);

        for (let i = 0; i < numExpenses; i++) {
          // Generate a random date within the target month, but not exceeding the current date
          const daysInMonth = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
          const randomDay = randomNumber(1, daysInMonth);
          let expenseDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), randomDay);

          // If this is the current month, ensure the date is not in the future
          if (targetMonthDate.getFullYear() === currentDate.getFullYear() && targetMonthDate.getMonth() === currentDate.getMonth()) {
            expenseDate.setDate(Math.min(randomDay, currentDate.getDate()));
          }
          
          // Ensure expenseDate is not before sixMonthsAgo (optional, but keeps consistency)
          if (expenseDate < sixMonthsAgo) expenseDate = new Date(sixMonthsAgo);

          const amount = randomNumber(expenseCat.min, expenseCat.max);
          const description = randomElement(expenseDescriptions[expenseCat.category]);
          
          const expense = new Expense({
            category: expenseCat.category,
            amount,
            description: `${description} - ${expenseDate.toLocaleDateString('en-US', { month: 'long' })}`,
            date: expenseDate,
            createdBy: financialManager._id,
            status: randomElement(['approved', 'approved', 'approved', 'approved', 'pending']), // 80% approved
            paymentMethod: randomElement(['company_account', 'credit_card', 'bank_transfer'])
          });
          
          await expense.save();
        }
      }
      
      console.log(`Created expenses for ${targetMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    }
    
    // Calculate and log summary statistics
    const totalPayments = await Payment.countDocuments();
    const totalExpenses = await Expense.countDocuments();
    const activeSubscriptionsCount = await UserSubscription.countDocuments({ status: 'active' });
    
    console.log('\n=== Financial Data Seeding Complete ===');
    console.log(`Created ${totalPayments} payment records`);
    console.log(`Created ${totalExpenses} expense records`);
    console.log(`Set up ${activeSubscriptionsCount} active subscriptions`);
    console.log('\nYour dashboard should now be populated with realistic data!');
    
  } catch (error) {
    console.error('Error seeding financial data:', error);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
};

// Run the seeding function
seedFinancialData();