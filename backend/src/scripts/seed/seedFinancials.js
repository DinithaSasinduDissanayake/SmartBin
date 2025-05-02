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
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const config = require('../../config'); // Fixed import path to config

// Import models
const User = require('../../models/User');
const SubscriptionPlan = require('../../models/SubscriptionPlan');
const UserSubscription = require('../../models/UserSubscription');
const Payment = require('../../models/Payment');
const Expense = require('../../models/Expense');
const Complaint = require('../../models/Complaint');
const Budget = require('../../models/Budget');

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
    // const MONGODB_URI = process.env.MONGODB_URI; // Replaced with config
    const MONGODB_URI = config.mongodbUri; // Now config is defined
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not configured in config/index.js or .env file. Please check your .env file.");
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    // Get financial manager user (needed for expense creation)
    const financialManager = await User.findOne({ role: 'financial_manager' });
    if (!financialManager) {
      console.log('No financial manager found. Please run createTestUsers.js first.');
      return;
    }
    // Get admin user (needed for assigning complaints)
    const adminUser = await User.findOne({ role: 'admin' });
    // Get staff users (needed for assigning complaints)
    const staffUsers = await User.find({ role: 'staff' });

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
          role: 'customer', // Updated role
          createdAt: randomDate(new Date(2024, 0, 1), new Date())
        });
        
        await newUser.save();
        console.log(`Created test customer: ${newUser.name}`);
      }
      
      // Fetch the newly created users
      users.push(...await User.find({ role: 'customer' })); // Updated role
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
    
    const allPlans = await SubscriptionPlan.find({}); // Ensure plans are fetched after creation/check

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
    // Removed duplicate declaration of subscriptionPlans
    // const subscriptionPlans = [...]; 

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
            subscriptionPlan: currentMonthPlan._id,
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

    // --- Generate Budget Allocations ---
    console.log('\nGenerating budget allocations...');
    
    // Clear existing budgets
    await Budget.deleteMany({});
    
    // Define budget notes for different categories
    const budgetNotes = {
      fuel: ['Allocated for fleet operations', 'Vehicle fuel budgeting', 'Transportation cost allocation'],
      maintenance: ['Equipment upkeep and repairs', 'Preventive maintenance allocation', 'Repair service budget'],
      salaries: ['Staff compensation planning', 'Employee salary allocation', 'Payroll budget planning'],
      utilities: ['Facility operational costs', 'Utilities expense planning', 'Service infrastructure budget'],
      equipment: ['New equipment acquisition', 'Equipment upgrade planning', 'Technology investment'],
      office: ['Office operational expenses', 'Administrative supply budget', 'Workplace essentials'],
      rent: ['Facility leasing costs', 'Space rental allocation', 'Property usage budget'],
      marketing: ['Promotional campaign funding', 'Marketing initiative budget', 'Brand development allocation'],
      insurance: ['Risk management allocation', 'Insurance policy budget', 'Coverage planning'],
      taxes: ['Regulatory fee allocation', 'Tax obligation planning', 'Compliance cost budget']
    };
    
    // Define monthly average budget target for different categories based on expense ranges
    // slightly higher than the average expense to account for planning and contingencies
    const monthlyTargetsByCategory = {
      fuel: 600,
      maintenance: 800,
      salaries: 4000,
      utilities: 600, 
      equipment: 1500,
      office: 200,
      rent: 2500,
      marketing: 1000,
      insurance: 1500,
      taxes: 3000
    };
    
    // Generate Monthly budgets for the current year (Jan-Dec 2025)
    console.log('Creating monthly budgets for 2025...');
    
    // Create monthly budgets starting from January through December 2025
    const monthlyPeriodTypes = ['Monthly'];
    const startMonth = 0; // January
    const endMonth = 11; // December
    
    for (let monthIdx = startMonth; monthIdx <= endMonth; monthIdx++) {
      // Create a monthly budget for each category
      for (const expenseCat of expenseCategories) {
        const category = expenseCat.category;
        const monthStartDate = new Date(currentDate.getFullYear(), monthIdx, 1); // 1st day of month
        const monthEndDate = new Date(currentDate.getFullYear(), monthIdx + 1, 0); // Last day of month
        
        // Skip if the month is in the past compared to the current date
        if (monthEndDate < currentMonthStart) continue;
        
        // Add some variability to the budget (±10% of target)
        const variabilityFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const baseAmount = monthlyTargetsByCategory[category] || 1000; // Default to 1000 if category not defined
        const allocatedAmount = Math.round(baseAmount * variabilityFactor);
        
        const budget = new Budget({
          category: category,
          periodType: 'Monthly',
          periodStartDate: monthStartDate,
          periodEndDate: monthEndDate,
          allocatedAmount: allocatedAmount,
          notes: randomElement(budgetNotes[category] || [`Budget for ${category}`]),
          createdBy: financialManager._id
        });
        
        await budget.save();
      }
      console.log(`Created monthly budgets for ${new Date(currentDate.getFullYear(), monthIdx, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`);
    }
    
    // Generate Quarterly budgets for the current year (Q1-Q4 2025)
    console.log('\nCreating quarterly budgets for 2025...');
    
    const quarters = [
      {name: 'Q1', startMonth: 0, endMonth: 2},
      {name: 'Q2', startMonth: 3, endMonth: 5},
      {name: 'Q3', startMonth: 6, endMonth: 8},
      {name: 'Q4', startMonth: 9, endMonth: 11}
    ];
    
    for (const quarter of quarters) {
      const quarterStartDate = new Date(currentDate.getFullYear(), quarter.startMonth, 1);
      const quarterEndDate = new Date(currentDate.getFullYear(), quarter.endMonth + 1, 0);
      
      // Skip if the quarter is completely in the past
      if (quarterEndDate < currentMonthStart) continue;
      
      // Create quarterly budget for each expense category
      for (const expenseCat of expenseCategories) {
        const category = expenseCat.category;
        
        // Calculate quarterly budget (3x monthly with some economies of scale)
        const monthlyBase = monthlyTargetsByCategory[category] || 1000;
        const quarterlyBase = monthlyBase * 3 * 0.95; // 5% savings for quarterly planning
        // Add variability (±8%)
        const variabilityFactor = 0.92 + Math.random() * 0.16; // 0.92 to 1.08
        const allocatedAmount = Math.round(quarterlyBase * variabilityFactor);
        
        const budget = new Budget({
          category: category,
          periodType: 'Quarterly',
          periodStartDate: quarterStartDate,
          periodEndDate: quarterEndDate,
          allocatedAmount: allocatedAmount,
          notes: `${quarter.name} ${currentDate.getFullYear()} planning for ${category} expenses`,
          createdBy: financialManager._id
        });
        
        await budget.save();
      }
      console.log(`Created quarterly budgets for ${quarter.name} ${currentDate.getFullYear()}`);
    }
    
    // Generate Yearly budgets for the current year (2025)
    console.log('\nCreating yearly budgets for 2025...');
    
    const yearStartDate = new Date(currentDate.getFullYear(), 0, 1);
    const yearEndDate = new Date(currentDate.getFullYear(), 11, 31);
    
    // Create yearly budget for each expense category
    for (const expenseCat of expenseCategories) {
      const category = expenseCat.category;
      
      // Calculate yearly budget (12x monthly with more significant economies of scale)
      const monthlyBase = monthlyTargetsByCategory[category] || 1000;
      const yearlyBase = monthlyBase * 12 * 0.9; // 10% savings for yearly planning
      // Add variability (±5%)
      const variabilityFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
      const allocatedAmount = Math.round(yearlyBase * variabilityFactor);
      
      const budget = new Budget({
        category: category,
        periodType: 'Yearly',
        periodStartDate: yearStartDate,
        periodEndDate: yearEndDate,
        allocatedAmount: allocatedAmount,
        notes: `Annual budget planning for ${category} - ${currentDate.getFullYear()}`,
        createdBy: financialManager._id
      });
      
      await budget.save();
    }
    console.log(`Created yearly budgets for ${currentDate.getFullYear()}`);
    
    // Create some budgets for next year (2026) for planning purposes
    console.log('\nCreating some budgets for next year (2026) for planning purposes...');
    
    const nextYearStartDate = new Date(currentDate.getFullYear() + 1, 0, 1);
    const nextYearEndDate = new Date(currentDate.getFullYear() + 1, 11, 31);
    
    // Just create a few quarterly budgets for Q1 and Q2 of next year
    const nextYearQuarters = [
      {name: 'Q1', startMonth: 0, endMonth: 2},
      {name: 'Q2', startMonth: 3, endMonth: 5}
    ];
    
    for (const quarter of nextYearQuarters) {
      const quarterStartDate = new Date(currentDate.getFullYear() + 1, quarter.startMonth, 1);
      const quarterEndDate = new Date(currentDate.getFullYear() + 1, quarter.endMonth + 1, 0);
      
      // Only create for a subset of categories for next year (preliminary planning)
      const planningCategories = ['fuel', 'salaries', 'rent', 'utilities'];
      
      for (const category of planningCategories) {
        const monthlyBase = monthlyTargetsByCategory[category] || 1000;
        // Add some inflation for next year (3-7%)
        const inflationFactor = 1.03 + Math.random() * 0.04; 
        const quarterlyBase = monthlyBase * 3 * inflationFactor;
        const allocatedAmount = Math.round(quarterlyBase);
        
        const budget = new Budget({
          category: category,
          periodType: 'Quarterly',
          periodStartDate: quarterStartDate,
          periodEndDate: quarterEndDate,
          allocatedAmount: allocatedAmount,
          notes: `Preliminary ${quarter.name} ${currentDate.getFullYear() + 1} planning for ${category}`,
          createdBy: financialManager._id
        });
        
        await budget.save();
      }
      console.log(`Created preliminary quarterly budgets for ${quarter.name} ${currentDate.getFullYear() + 1}`);
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
        // Find active subscriptions for this plan (FIX: use 'subscriptionPlan' field)
        const activeSubs = await UserSubscription.find({ subscriptionPlan: plan._id, status: 'active' });
        
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
            // Increase probability of 'completed' status for revenue calculations
            status: Math.random() < 0.8 ? 'completed' : randomElement(['pending', 'failed']), // 80% chance completed
            paymentMethod: randomElement(['credit_card', 'paypal', 'bank_transfer']),
            description: `Payment for ${plan.name} subscription` // Always provide a description
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
      const plan = await SubscriptionPlan.findById(sub.subscriptionPlan); // FIX: use 'subscriptionPlan' field
      if (!plan) continue;
      const payment = new Payment({
        user: sub.user,
        userSubscription: sub._id,
        amount: plan.price,
        paymentDate: addDays(currentMonthStart, randomNumber(0, currentDate.getDate() - 1)), // Random day within current month up to today
        status: 'completed',
        paymentMethod: randomElement(['credit_card', 'paypal', 'bank_transfer']),
        description: `Payment for ${plan.name} subscription` // Always provide a description
      });
      await payment.save();
    }

    // --- Guarantee some subscriptions are ENDING SOON ---
    console.log('\nEnsuring some subscriptions are ending soon...');
    const soonEndingSubs = await UserSubscription.find({ status: 'active' }).limit(3);
    for (const sub of soonEndingSubs) {
      const newEndDate = addDays(currentDate, randomNumber(3, 14)); // Ending in 3-14 days from 'today'
      sub.endDate = newEndDate;
      sub.nextBillingDate = newEndDate; // Adjust next billing too
      await sub.save();
      console.log(`Adjusted subscription ${sub._id} for user ${sub.user} to end on ${newEndDate.toLocaleDateString()}`);
    }


    // --- Guarantee specific data points for Dashboard ---
    console.log(`\nEnsuring specific data points exist for the current date (${currentDate.toLocaleDateString()})...`);

    // 1. Guarantee PENDING Expenses
    const pendingExpenseCategories = expenseCategories.map(ec => ec.category);
    for (let i = 0; i < 2; i++) {
      const expense = new Expense({
        category: randomElement(pendingExpenseCategories),
        amount: randomNumber(50, 500),
        description: `Guaranteed PENDING expense (${i + 1})`,
        date: addDays(currentDate, randomNumber(-5, 0)), // Created recently
        createdBy: financialManager._id,
        status: 'pending', // Explicitly set to pending
        paymentMethod: randomElement(['company_account', 'credit_card', 'bank_transfer'])
      });
      await expense.save();
      console.log(`Created PENDING expense: ${expense.description}`);
    }

    // 2. Guarantee PENDING Payments (e.g., upcoming scheduled payments)
    const customersForPending = await User.find({ role: 'customer' }).limit(2);
    for (let i = 0; i < customersForPending.length; i++) {
        const user = customersForPending[i];
        const dueDate = addDays(currentDate, randomNumber(1, 7)); // Due in 1-7 days
        const payment = new Payment({
            user: user._id,
            amount: randomNumber(50, 200),
            paymentDate: null, // Not paid yet
            dueDate: dueDate, // Set a due date
            status: 'pending', // Explicitly set to pending
            paymentMethod: randomElement(['credit_card', 'paypal']),
            description: `Guaranteed PENDING payment for ${user.name} (${i + 1})`
        });
        await payment.save();
        console.log(`Created PENDING payment for ${user.name} due ${dueDate.toLocaleDateString()}`);
    }

    // 3. Guarantee Payments made TODAY
    const customersForTodayPayment = await User.find({ role: 'customer' }).limit(2);
    for (let i = 0; i < customersForTodayPayment.length; i++) {
        const user = customersForTodayPayment[i];
        const plan = randomElement(allPlans); // Use a random plan
        // Find the user's active subscription for this plan
        const userSub = await UserSubscription.findOne({ user: user._id, subscriptionPlan: plan._id, status: 'active' });
        if (!userSub) {
            console.warn(`No active subscription found for user ${user.name} and plan ${plan.name}. Skipping payment.`);
            continue;
        }
        const payment = new Payment({
            user: user._id,
            userSubscription: userSub._id, // Link payment to the subscription
            amount: plan.price,
            paymentDate: currentDate, // Set payment date to 'today'
            status: 'completed',
            paymentMethod: randomElement(['credit_card', 'paypal']),
            description: `Guaranteed TODAY's payment for ${plan.name} (${i + 1})`
        });
        await payment.save();
        console.log(`Created TODAY's payment for ${user.name}`);
    }

    // 4. Guarantee Financial-related Complaints
    console.log('\nGenerating financial-related complaints...');
    await Complaint.deleteMany({ subject: /Billing Issue|Payment Problem|Subscription Query/ }); // Clear previous seeded financial complaints
    const complaintSubjects = [
        'Billing Issue: Incorrect charge on invoice',
        'Payment Problem: Payment failed to process',
        'Subscription Query: How to upgrade plan?',
        'Billing Issue: Double charged for service',
        'Payment Problem: Cannot update payment method'
    ];
    const customersForComplaints = await User.find({ role: 'customer' }).limit(complaintSubjects.length);
    const staffOrAdmin = [...staffUsers, adminUser].filter(Boolean); // Combine staff and admin

    for (let i = 0; i < complaintSubjects.length; i++) {
        if (customersForComplaints.length === 0) break; // No customers to assign complaints to
        const user = customersForComplaints[i % customersForComplaints.length]; // Cycle through customers
        const assignedTo = staffOrAdmin.length > 0 ? randomElement(staffOrAdmin)._id : null; // Assign randomly if staff/admin exist

        const complaint = new Complaint({
            user: user._id,
            subject: complaintSubjects[i],
            description: `This is a seeded complaint about: ${complaintSubjects[i]}. User ${user.name} needs assistance. Please investigate.`,
            status: randomElement(['Open', 'In Progress']), // Mostly open or in progress
            createdAt: addDays(currentDate, randomNumber(-14, 0)), // Created within the last 2 weeks
            assignedAdmin: assignedTo
        });
        await complaint.save();
        console.log(`Created complaint: "${complaint.subject}" for user ${user.name}`);
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