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
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable not set. Please check your .env file.");
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

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
    const currentDate = new Date(2025, 3, 26); // Set a fixed current date for consistency (April 26, 2025)
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentYearStart = new Date(currentDate.getFullYear(), 0, 1);

    console.log(`Current Date set to: ${currentDate.toDateString()}`);
    console.log(`Generating data for the period up to ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}...`);

    // Clear existing user subscriptions 
    await UserSubscription.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    
    // --- Ensure Roles Exist ---
    const roles = ['admin', 'financial_manager', 'staff', 'customer'];
    for (const role of roles) {
      const existingRole = await User.findOne({ role });
      if (!existingRole) {
        const newUser = new User({
          name: `${role} User`,
          email: `${role}@example.com`,
          password: 'Password123!',
          role,
          createdAt: new Date()
        });
        await newUser.save();
        console.log(`Created test ${role} user: ${newUser.name}`);
      }
    }

    // --- Create Subscription Plans ---
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

    // --- Create Users and Subscriptions ---
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
      const startDate = randomDate(currentYearStart, currentDate);
      
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
    } // End user creation loop

    // --- Guarantee some subscriptions started THIS MONTH ---
    console.log('\\nEnsuring some subscriptions started this month...');
    const currentMonthUsers = await User.find({ role: 'customer' }).limit(3); // Get a few customers
    const currentMonthPlan = await SubscriptionPlan.findOne({ name: 'Standard Monthly' }); // Use a specific plan

    if (currentMonthUsers.length > 0 && currentMonthPlan) {
      for (const user of currentMonthUsers) {
        // Check if user already has an active sub this month to avoid duplicates
        const existingSub = await UserSubscription.findOne({ 
          user: user._id, 
          startDate: { $gte: currentMonthStart, $lte: currentDate } 
        });
        
        if (!existingSub) {
          const newSubStartDate = addDays(currentMonthStart, Math.floor(Math.random() * (currentDate.getDate()))); // Random day this month
          const newSubEndDate = addMonths(newSubStartDate, 1); // Assuming monthly plan
          
          const newUserSub = new UserSubscription({
            user: user._id,
            plan: currentMonthPlan._id,
            startDate: newSubStartDate,
            endDate: newSubEndDate,
            status: 'active',
            billingCycle: currentMonthPlan.duration,
          });
          await newUserSub.save();
          console.log(`Created a new subscription for ${user.name} starting ${newSubStartDate.toLocaleDateString()}`);

          // --- Also create a corresponding PAYMENT for this new subscription ---
          const paymentForNewSub = new Payment({
            user: user._id,
            amount: currentMonthPlan.price,
            paymentDate: newSubStartDate, // Pay on the start date
            status: 'completed',
            paymentMethod: randomElement(['credit_card', 'paypal']),
            description: `Payment for ${currentMonthPlan.name} subscription`,
            userSubscription: newUserSub._id // Link payment to the subscription
          });
          await paymentForNewSub.save();
          console.log(`Created corresponding payment for ${user.name}'s new subscription.`);
        }
      }
    } else {
      console.log('Could not find users or Standard Monthly plan to guarantee current month subscriptions.');
    }


    // --- Generate Expenses ---
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
      office: ['Office supplies', 'Stationery', 'Cleaning supplies', 'Break room supplies', 'Small equipment
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
    
    // Generate monthly expenses for each category for the past 12 months up to the current month
    // Ensure we cover the start of the current year and the last few months explicitly
    const firstExpenseMonth = new Date(currentDate.getFullYear(), 0, 1); // Start from Jan of the current year

    // Generate for Jan 2025 up to the current month (April 2025)
    for (let monthOffset = 0; monthOffset <= currentDate.getMonth(); monthOffset++) {
      const targetMonthDate = addMonths(firstExpenseMonth, monthOffset);
      const daysInMonth = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
      const monthEndDay = (targetMonthDate.getFullYear() === currentDate.getFullYear() && targetMonthDate.getMonth() === currentDate.getMonth())
                          ? currentDate.getDate() // Use current day for the current month
                          : daysInMonth; // Use last day for past months

      console.log(`Generating expenses for ${targetMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}...`);

      // For each expense category
      for (const expenseCat of expenseCategories) {
        // Create 2-5 expenses per category per month for richer data
        const numExpenses = randomNumber(2, 5);
        for (let i = 0; i < numExpenses; i++) {
          const randomDay = randomNumber(1, monthEndDay); // Ensure date is within the valid range for the month
          const expenseDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), randomDay);
          
          // Skip if the generated date is in the future relative to currentDate (shouldn't happen with logic above, but good safeguard)
          if (expenseDate > currentDate) continue;

          const expense = new Expense({
            category: expenseCat.category,
            amount: randomNumber(expenseCat.min, expenseCat.max),
            description: randomElement(expenseDescriptions[expenseCat.category]),
            date: expenseDate,
            createdBy: financialManager._id, // Assign to the financial manager
            status: randomElement(['pending', 'approved', 'rejected']), // Random status
            paymentMethod: randomElement(['company_account', 'credit_card', 'bank_transfer'])
          });
          await expense.save();
        }
      }
    }

    // Generate monthly payments for each plan for the past 12 months up to the current month
    // Ensure we cover the start of the current year and the last few months explicitly
    const firstPaymentMonth = new Date(currentDate.getFullYear(), 0, 1); // Start from Jan of the current year

    // Generate for Jan 2025 up to the current month (April 2025)
    for (let monthOffset = 0; monthOffset <= currentDate.getMonth(); monthOffset++) {
      const targetMonthDate = addMonths(firstPaymentMonth, monthOffset);
      const daysInMonth = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
      const monthEndDay = (targetMonthDate.getFullYear() === currentDate.getFullYear() && targetMonthDate.getMonth() === currentDate.getMonth())
                          ? currentDate.getDate() // Use current day for the current month
                          : daysInMonth; // Use last day for past months

      console.log(`Generating payments for ${targetMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}...`);

      // For each subscription plan
      for (const plan of subscriptionPlans) {
        // Find active subscriptions for this plan
        const activeSubs = await UserSubscription.find({ plan: plan._id, status: 'active' });
        
        // Create payments for a subset of active subscribers each month
        const numPayments = Math.min(activeSubs.length, randomNumber(5, 15)); // Simulate payments from 5-15 active users
        
        for (let i = 0; i < numPayments; i++) {
          const sub = activeSubs[i]; // Select a subscriber
          if (!sub) continue; // Skip if no subscriber found (shouldn't happen if activeSubs exist)

          const randomDay = randomNumber(1, monthEndDay); // Ensure date is within the valid range for the month
          const paymentDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), randomDay);

          // Skip if the generated date is in the future relative to currentDate
          if (paymentDate > currentDate) continue;

          const payment = new Payment({
            user: sub.user,
            userSubscription: sub._id,
            amount: plan.price,
            paymentDate: paymentDate,
            status: randomElement(['completed', 'pending', 'failed']), // Random status
            paymentMethod: randomElement(['credit_card', 'paypal', 'bank_transfer'])
          });
          await payment.save();
        }
      }
    }

    // Guarantee at least 3 approved expenses and 3 completed payments for the CURRENT month (April 2025)
    console.log(`Ensuring some data exists for the current month (${currentMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})...`);
    const expenseCategoriesList = expenseCategories.map(ec => ec.category); // Get list of category names
    for (let i = 0; i < 3; i++) {
      const expense = new Expense({
        category: randomElement(expenseCategoriesList),
        amount: randomNumber(200, 2000),
        description: `Guaranteed expense for current month (${i + 1})`,
        date: addDays(currentMonthStart, randomNumber(0, currentDate.getDate() - 1)), // Random day within current month up to today
        createdBy: financialManager._id,
        status: 'approved',
        paymentMethod: randomElement(['company_account', 'credit_card', 'bank_transfer'])
      });
      await expense.save();
    }

    const activeSubsCurrent = await UserSubscription.find({ status: 'active' }).limit(3);
    for (let i = 0; i < Math.min(3, activeSubsCurrent.length); i++) {
      const sub = activeSubsCurrent[i];
      const plan = await SubscriptionPlan.findById(sub.plan);
      if (!plan) continue;
      const payment = new Payment({
        user: sub.user,
        userSubscription: sub._id,
        amount: plan.price,
        paymentDate: addDays(currentMonthStart, randomNumber(0, currentDate.getDate() - 1)), // Random day within current month up to today
        status: 'completed',
        paymentMethod: randomElement(['credit_card', 'paypal', 'bank_transfer'])
      });
      await payment.save();
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