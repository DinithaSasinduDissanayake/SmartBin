// fullSeed.js - Master seeder for SmartBin
// Follows SmartBin backend conventions and ensures all data relationships are correct

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs'); // Added bcrypt for password hashing
// Ensure dotenv path is correct relative to this script's location
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const config = require('../../config'); // Adjusted path

// Import models
const User = require('../../models/User'); // Adjusted path
const SubscriptionPlan = require('../../models/SubscriptionPlan'); // Adjusted path
const UserSubscription = require('../../models/UserSubscription'); // Adjusted path
const Payment = require('../../models/Payment'); // Adjusted path
const Expense = require('../../models/Expense'); // Adjusted path
const Budget = require('../../models/Budget');
const PayrollLog = require('../../models/PayrollLog');
const Attendance = require('../../models/Attendance');
const Performance = require('../../models/Performance');
const Complaint = require('../../models/Complaint');
const Document = require('../../models/Document');

// Remove or comment out problematic TypeScript imports since they can't be directly required
// const Equipment = require('../../../models/equipment');
// const Truck = require('../../../models/truck');
// const Tool = require('../../../models/tool');
// const Schedule = require('../../../models/schedule');

// Fixed "Current Date" for consistent seeding
const DEMO_CURRENT_DATE = new Date('2025-04-30T12:00:00Z');
// Start Date: 1 year and 3 months before DEMO_CURRENT_DATE
const SEED_START_DATE = new Date(DEMO_CURRENT_DATE);
SEED_START_DATE.setFullYear(SEED_START_DATE.getFullYear() - 1);
SEED_START_DATE.setMonth(SEED_START_DATE.getMonth() - 3);

const verificationStatuses = ['Pending', 'Verified', 'Rejected'];

// Utility function to generate random number between min and max
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Utility function to get a random element from an array
const randomElement = (array) => {
  if (!array || array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
};

// Utility: add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Utility: add months to a date
function addMonths(date, months) {
  const result = new Date(date);
  // Handle potential day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
  const originalDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() !== originalDay) {
    result.setDate(0); // Go to the last day of the previous month
  }
  return result;
}

// Utility function to generate a random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Utility: generate a unique invoice number (Placeholder - needs implementation if required)
async function generateUniqueInvoiceNumber() {
  // Placeholder logic - replace with actual unique generation if needed
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${timestamp}-${randomSuffix}`;
}

// Ensure demo users for all roles exist
async function ensureUsers() {
  console.log('Ensuring demo users exist...');
  const roles = ['admin', 'financial_manager', 'staff', 'customer'];
  const usersData = {
    admin: { name: 'Admin User', email: 'admin@example.com', password: 'Password123!' },
    admin2: { name: 'Second Admin', email: 'admin2@example.com', password: 'Password123!' }, // Added second admin
    financial_manager: { name: 'Finance Manager', email: 'finance@example.com', password: 'Password123!' },
    staff: { name: 'Staff Member', email: 'staff@example.com', password: 'Password123!' },
    customer: { name: 'Customer User', email: 'customer@example.com', password: 'Password123!' }
  };
  const createdUsers = {};

  // Add admin2 to the roles array if it's not already there for processing
  if (!roles.includes('admin2')) {
      roles.splice(1, 0, 'admin2'); // Insert 'admin2' after 'admin'
  }

  for (const role of roles) {
    // Handle the case where role might be 'admin2' but data is keyed differently
    const userData = usersData[role] || usersData['admin2']; // Fallback for admin2 key
    if (!userData) {
        console.warn(`No user data found for role: ${role}`);
        continue;
    }
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      // Assign the correct role ('admin' for 'admin2')
      const userRole = role === 'admin2' ? 'admin' : role;
      const hashedPassword = await bcrypt.hash(userData.password, 12); // Hash password before saving
      user = new User({ ...userData, password: hashedPassword, role: userRole });
      await user.save();
      console.log(`Created ${userRole} user: ${user.email}`);
    } else {
      console.log(`${role} user already exists: ${user.email}`);
    }
    // Store the primary admin user under 'admin' key for later use
    if (role === 'admin') {
        createdUsers['admin'] = user;
    } else if (role !== 'admin2') { // Don't overwrite coreUsers.admin with admin2
        createdUsers[role] = user;
    }
  }

  // Ensure additional staff and customers if needed for variety
  const targetStaff = 5;
  const targetCustomers = 20;
  let staffCount = await User.countDocuments({ role: 'staff' });
  let customerCount = await User.countDocuments({ role: 'customer' });

  while (staffCount < targetStaff) {
    const staffIndex = staffCount + 1;
    const email = `staff${staffIndex}@example.com`;
    let staffUser = await User.findOne({ email });
    if (!staffUser) {
        staffUser = new User({
            name: `Staff Member ${staffIndex}`,
            email: email,
            password: 'Password123!',
            role: 'staff'
        });
        await staffUser.save();
        console.log(`Created additional staff user: ${email}`);
    }
    staffCount++;
  }

  while (customerCount < targetCustomers) {
    const customerIndex = customerCount + 1;
    const email = `customer${customerIndex}@example.com`;
    let customerUser = await User.findOne({ email });
    if (!customerUser) {
        customerUser = new User({
            name: `Customer User ${customerIndex}`,
            email: email,
            password: 'Password123!',
            role: 'customer'
        });
        await customerUser.save();
        console.log(`Created additional customer user: ${email}`);
    }
    customerCount++;
  }

  return createdUsers; // Return the main role users for assignment
}

// Ensure demo subscription plans exist
async function ensurePlans() {
  console.log('Ensuring subscription plans exist...');
  const plansData = [
    { name: 'Basic', price: 49.99, description: 'Basic waste collection service with weekly pickup and app access.', duration: 'Monthly' },
    { name: 'Standard', price: 79.99, description: 'Enhanced service with twice-weekly pickup, recycling options, and advanced app features.', duration: 'Monthly' },
    { name: 'Premium', price: 99.99, description: 'Premium service with unlimited pickup, priority service, recycling and composting options, and full app features.', duration: 'Monthly' },
    { name: 'Business', price: 199.99, description: 'Comprehensive waste management solution for small to medium businesses with daily collection and dedicated support.', duration: 'Monthly' }
  ];
  const createdPlans = [];
  for (const planData of plansData) {
    let plan = await SubscriptionPlan.findOne({ name: planData.name });
    if (!plan) {
      plan = new SubscriptionPlan(planData);
      await plan.save();
      console.log(`Created subscription plan: ${plan.name}`);
    } else {
      // Ensure price is a number if it exists as a string
      if (typeof plan.price === 'string') {
        plan.price = parseFloat(plan.price);
        await plan.save();
        console.log(`Updated price type for plan: ${plan.name}`);
      }
      console.log(`Subscription plan already exists: ${plan.name}`);
    }
    createdPlans.push(plan);
  }
  return createdPlans;
}

async function cleanSlate() {
  console.log('Clearing existing transactional data...');
  // Clean all transactional and dashboard-related collections
  await Promise.all([
    UserSubscription.deleteMany({}),
    Payment.deleteMany({}),
    Expense.deleteMany({}),
    Budget.deleteMany({}),
    PayrollLog.deleteMany({}),
    Attendance.deleteMany({}),
    Performance.deleteMany({}),
    Complaint.deleteMany({}),
    Document.deleteMany({})
  ]);
  // Reset subscriber count on plans (don't delete plans themselves)
  await SubscriptionPlan.updateMany({}, { $set: { subscriberCount: 0 } });
  console.log('Existing transactional data cleared.');
}

async function ensureSubscriptions(customers, plans, startDate, endDate) {
    console.log(`Generating subscriptions from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
    await UserSubscription.deleteMany({}); // Clear only subscriptions
    await SubscriptionPlan.updateMany({}, { $set: { subscriberCount: 0 } }); // Reset counts

    const planWeights = [0.4, 0.3, 0.2, 0.1]; // Basic, Standard, Premium, Business

    for (const customer of customers) {
        // Select plan
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
        const selectedPlan = plans[selectedPlanIndex];

        // Determine subscription start date within the 15-month period
        const subStartDate = randomDate(startDate, endDate);
        const durationInMonths = 1; // Assume monthly for simplicity, can be enhanced

        // Simulate renewals if start date is far enough in the past
        let currentSubStartDate = new Date(subStartDate);
        let currentSubEndDate = addMonths(currentSubStartDate, durationInMonths);
        let isActive = false;

        while (currentSubEndDate < endDate) {
            // Check if this subscription period overlaps with the "current date"
            if (currentSubStartDate <= DEMO_CURRENT_DATE && currentSubEndDate > DEMO_CURRENT_DATE) {
                isActive = true;
                break; // Found the currently active subscription period
            }
            // Simulate renewal
            currentSubStartDate = currentSubEndDate;
            currentSubEndDate = addMonths(currentSubStartDate, durationInMonths);
        }
        // If the loop finished and the last period ends after DEMO_CURRENT_DATE, it's active
        if (!isActive && currentSubEndDate > DEMO_CURRENT_DATE && currentSubStartDate <= DEMO_CURRENT_DATE) {
             isActive = true;
        }

        const subscription = new UserSubscription({
            user: customer._id,
            subscriptionPlan: selectedPlan._id,
            startDate: currentSubStartDate, // Start date of the *current* active period
            endDate: currentSubEndDate,     // End date of the *current* active period
            status: isActive ? 'active' : 'expired', // Determine status based on DEMO_CURRENT_DATE
            autoRenew: Math.random() > 0.1,
            lastBillingDate: currentSubStartDate, // Simplified
            nextBillingDate: isActive ? currentSubEndDate : null, // Only set if active
        });
        await subscription.save();

        if (isActive) {
            await SubscriptionPlan.findByIdAndUpdate(selectedPlan._id, { $inc: { subscriberCount: 1 } });
        }
    }
    console.log(`Generated ${await UserSubscription.countDocuments()} subscriptions.`);

    // Ensure some subscriptions started THIS MONTH (relative to DEMO_CURRENT_DATE)
    console.log('Ensuring some subscriptions started this month...');
    const currentMonthStart = new Date(DEMO_CURRENT_DATE.getFullYear(), DEMO_CURRENT_DATE.getMonth(), 1);
    const fewCustomers = await User.find({ role: 'customer' }).limit(3);
    const standardPlan = plans.find(p => p.name === 'Standard');

    if (standardPlan && fewCustomers.length > 0) {
        for (const customer of fewCustomers) {
            const existingSub = await UserSubscription.findOne({ user: customer._id, status: 'active' });
            if (!existingSub) { // Only add if they don't have an active one
                 const newSubStartDate = randomDate(currentMonthStart, DEMO_CURRENT_DATE);
                 const newSubEndDate = addMonths(newSubStartDate, 1);
                 const newSub = new UserSubscription({
                     user: customer._id,
                     subscriptionPlan: standardPlan._id,
                     startDate: newSubStartDate,
                     endDate: newSubEndDate,
                     status: 'active',
                     autoRenew: true,
                     lastBillingDate: newSubStartDate,
                     nextBillingDate: newSubEndDate,
                 });
                 await newSub.save();
                 await SubscriptionPlan.findByIdAndUpdate(standardPlan._id, { $inc: { subscriberCount: 1 } });
                 console.log(`Created current month subscription for ${customer.email}`);
            }
        }
    }

    // Ensure some subscriptions are ENDING SOON (relative to DEMO_CURRENT_DATE)
    console.log('Ensuring some subscriptions are ending soon...');
    const activeSubs = await UserSubscription.find({ status: 'active' }).limit(3);
    for (const sub of activeSubs) {
        const newEndDate = addDays(DEMO_CURRENT_DATE, randomNumber(1, 14)); // End in 1-14 days
        sub.endDate = newEndDate;
        sub.nextBillingDate = newEndDate;
        await sub.save();
        console.log(`Adjusted subscription ${sub._id} to end soon: ${newEndDate.toDateString()}`);
    }
}

async function ensurePayments(users, plans, startDate, endDate) {
    console.log(`Generating payments from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
    await Payment.deleteMany({});
    const payments = [];
    const paymentMethods = ['credit_card', 'paypal', 'bank_transfer'];
    const paymentStatuses = ['completed', 'pending', 'failed'];

    const subscriptions = await UserSubscription.find().populate('subscriptionPlan');

    for (const sub of subscriptions) {
        if (!sub.subscriptionPlan) continue; // Skip if plan details missing

        let paymentDate = new Date(sub.startDate);
        const planPrice = typeof sub.subscriptionPlan.price === 'number' ? sub.subscriptionPlan.price : parseFloat(sub.subscriptionPlan.price || '0');

        // Generate payments for the subscription's lifetime within the seed range
        while (paymentDate < sub.endDate && paymentDate < endDate) {
            // Only create payment if it falls within the seed range
            if (paymentDate >= startDate) {
                 // Simulate payment status: more likely completed, some pending/failed, fewer failures before DEMO_CURRENT_DATE
                 let status;
                 if (paymentDate > DEMO_CURRENT_DATE) {
                     status = 'pending'; // Future payments are pending
                 } else if (paymentDate <= DEMO_CURRENT_DATE) {
                     const randomStatus = Math.random();
                     if (randomStatus < 0.85) status = 'completed'; // 85% completed
                     else if (randomStatus < 0.95) status = 'pending'; // 10% pending (e.g., processing)
                     else status = 'failed'; // 5% failed
                 } else {
                     status = 'pending'; // Default future to pending
                 }

                payments.push({
                    user: sub.user,
                    userSubscription: sub._id,
                    amount: planPrice,
                    paymentDate: status === 'completed' || status === 'failed' ? new Date(paymentDate) : null, // Only set date if processed
                    dueDate: new Date(paymentDate), // Due date is the cycle start
                    status: status,
                    paymentMethod: randomElement(paymentMethods),
                    description: `Payment for ${sub.subscriptionPlan.name} plan`,
                    invoiceNumber: await generateUniqueInvoiceNumber(), // Generate unique invoice number
                });
            }
            // Move to the next payment cycle date
            paymentDate = addMonths(paymentDate, 1); // Assuming monthly plans
        }
    }

    // Add some standalone payments (e.g., one-off charges, not linked to subs)
    const numStandalone = users.length * 0.5; // 50% of users have a standalone payment
    for (let i = 0; i < numStandalone; i++) {
        const user = randomElement(users);
        const paymentDate = randomDate(startDate, endDate);
        if (paymentDate > DEMO_CURRENT_DATE) continue; // Don't create standalone payments in the future

        payments.push({
            user: user._id,
            userSubscription: null, // Not linked to a subscription
            amount: randomNumber(10, 50), // Smaller amounts
            paymentDate: new Date(paymentDate),
            dueDate: new Date(paymentDate),
            status: Math.random() < 0.9 ? 'completed' : 'failed', // Mostly completed
            paymentMethod: randomElement(paymentMethods),
            description: randomElement(['Bin replacement fee', 'Extra pickup charge', 'Late payment fee']),
            invoiceNumber: await generateUniqueInvoiceNumber(),
        });
    }

    if (payments.length > 0) {
        await Payment.insertMany(payments);
    }
    console.log(`Generated ${await Payment.countDocuments()} payments.`);

    // Ensure some payments occurred TODAY (relative to DEMO_CURRENT_DATE)
    console.log('Ensuring some payments occurred today...');
    const todaySubs = await UserSubscription.find({ status: 'active' }).limit(2).populate('subscriptionPlan');
    for (const sub of todaySubs) {
         if (!sub.subscriptionPlan) continue;
         const planPrice = typeof sub.subscriptionPlan.price === 'number' ? sub.subscriptionPlan.price : parseFloat(sub.subscriptionPlan.price || '0');
         const existingTodayPayment = await Payment.findOne({ user: sub.user, paymentDate: DEMO_CURRENT_DATE });
         if (!existingTodayPayment) {
             await Payment.create({
                 user: sub.user,
                 userSubscription: sub._id,
                 amount: planPrice,
                 paymentDate: DEMO_CURRENT_DATE,
                 dueDate: DEMO_CURRENT_DATE,
                 status: 'completed',
                 paymentMethod: randomElement(paymentMethods),
                 description: `Today's payment for ${sub.subscriptionPlan.name}`,
                 invoiceNumber: await generateUniqueInvoiceNumber(),
             });
             console.log(`Created today's payment for user ${sub.user}`);
         }
    }

    // Ensure some payments are PENDING (due soon, relative to DEMO_CURRENT_DATE)
    console.log('Ensuring some payments are pending...');
    const pendingSubs = await UserSubscription.find({ status: 'active' }).limit(2).populate('subscriptionPlan');
     for (const sub of pendingSubs) {
         if (!sub.subscriptionPlan) continue;
         const dueDate = addDays(DEMO_CURRENT_DATE, randomNumber(1, 7)); // Due in 1-7 days
         const planPrice = typeof sub.subscriptionPlan.price === 'number' ? sub.subscriptionPlan.price : parseFloat(sub.subscriptionPlan.price || '0');
         const existingPending = await Payment.findOne({ user: sub.user, status: 'pending', dueDate: { $gt: DEMO_CURRENT_DATE } });
         if (!existingPending) {
             await Payment.create({
                 user: sub.user,
                 userSubscription: sub._id,
                 amount: planPrice,
                 paymentDate: null,
                 dueDate: dueDate,
                 status: 'pending',
                 paymentMethod: randomElement(paymentMethods),
                 description: `Upcoming payment for ${sub.subscriptionPlan.name}`,
                 invoiceNumber: await generateUniqueInvoiceNumber(),
             });
             console.log(`Created pending payment for user ${sub.user} due ${dueDate.toDateString()}`);
         }
     }
}

async function ensureExpenses(financialManager, startDate, endDate) {
    console.log(`Generating expenses from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
    await Expense.deleteMany({});
    const expenses = [];
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
    const expenseDescriptions = {
      fuel: ['Vehicle refueling', 'Truck fleet fuel', 'Collection vehicle diesel'],
      maintenance: ['Vehicle maintenance', 'Equipment repair', 'Bin repair services'],
      salaries: ['Staff payroll', 'Employee benefits', 'Contractor payments'],
      utilities: ['Electricity bill', 'Water services', 'Internet and phone'],
      equipment: ['New sorting equipment', 'Replacement bins', 'Safety gear'],
      office: ['Office supplies', 'Stationery', 'Cleaning supplies'],
      rent: ['Office space rent', 'Warehouse rental', 'Storage facility'],
      marketing: ['Promotional materials', 'Digital advertising', 'Community outreach'],
      insurance: ['Vehicle insurance', 'Liability coverage', 'Property insurance'],
      taxes: ['Property tax', 'Business tax payment', 'Regulatory fees']
    };
    // Corrected statuses to match the Expense model enum
    const expenseStatuses = ['approved', 'pending', 'rejected'];
    // Corrected payment methods to match the Expense model enum
    const paymentMethods = ['company_account', 'credit_card', 'bank_transfer', 'cash', 'other'];

    let currentDatePointer = new Date(startDate);
    while (currentDatePointer <= endDate) {
        // Generate 5-15 expenses per month
        const numExpensesThisMonth = randomNumber(5, 15);
        for (let i = 0; i < numExpensesThisMonth; i++) {
            const expenseDate = randomDate(currentDatePointer, addMonths(currentDatePointer, 1) > endDate ? endDate : addMonths(currentDatePointer, 1));
            if (expenseDate > endDate) continue; // Ensure not past the final end date

            const categoryInfo = randomElement(expenseCategories);
            let status;
             if (expenseDate > DEMO_CURRENT_DATE) {
                 status = 'pending'; // Future expenses are pending approval
             } else {
                 // Past/Present expenses: Mostly approved, some pending/rejected
                 const randomStatus = Math.random();
                 if (randomStatus < 0.75) status = 'approved'; // 75% approved
                 else if (randomStatus < 0.90) status = 'pending';  // 15% pending
                 else status = 'rejected'; // 10% rejected
             }

            expenses.push({
                category: categoryInfo.category,
                amount: randomNumber(categoryInfo.min, categoryInfo.max),
                description: randomElement(expenseDescriptions[categoryInfo.category]),
                date: new Date(expenseDate),
                createdBy: financialManager._id,
                status: status,
                // Only set payment method if approved (as 'paid' status is removed)
                paymentMethod: status === 'approved' ? randomElement(paymentMethods) : null,
                receiptUrl: null, // Placeholder
            });
        }
        currentDatePointer = addMonths(currentDatePointer, 1);
    }

    if (expenses.length > 0) {
        await Expense.insertMany(expenses);
    }
    console.log(`Generated ${await Expense.countDocuments()} expenses.`);

    // Ensure some expenses are PENDING (relative to DEMO_CURRENT_DATE)
    console.log('Ensuring some expenses are pending...');
    for (let i = 0; i < 3; i++) {
        const categoryInfo = randomElement(expenseCategories);
        const expenseDate = addDays(DEMO_CURRENT_DATE, randomNumber(-7, 0)); // Created recently
        const existingPending = await Expense.findOne({ status: 'pending', date: { $gte: addDays(DEMO_CURRENT_DATE, -7) } });
        if (!existingPending) {
            await Expense.create({
                category: categoryInfo.category,
                amount: randomNumber(categoryInfo.min, categoryInfo.max),
                description: `Pending expense check ${i + 1}`,
                date: expenseDate,
                createdBy: financialManager._id,
                status: 'pending',
                paymentMethod: null,
            });
            console.log(`Created pending expense for ${categoryInfo.category}`);
        }
    }
     // Ensure some expenses occurred TODAY (relative to DEMO_CURRENT_DATE)
    console.log('Ensuring some expenses occurred today...');
    for (let i = 0; i < 2; i++) {
        const categoryInfo = randomElement(expenseCategories);
        const existingToday = await Expense.findOne({ date: DEMO_CURRENT_DATE });
        if (!existingToday) {
            await Expense.create({
                category: categoryInfo.category,
                amount: randomNumber(categoryInfo.min, categoryInfo.max),
                description: `Today's expense ${i + 1}`,
                date: DEMO_CURRENT_DATE,
                createdBy: financialManager._id,
                status: 'approved', // Today's can only be approved or pending now
                paymentMethod: randomElement(paymentMethods), // Assign a method if approved
            });
            console.log(`Created today's expense for ${categoryInfo.category}`);
        }
    }
}

async function ensureBudgets(financialManager, startDate, endDate) {
  console.log(`Generating budgets from ${startDate.getFullYear()} to ${endDate.getFullYear()}...`);
  await Budget.deleteMany({});
  const budgets = [];
  const categories = ['fuel', 'maintenance', 'salaries', 'utilities', 'equipment', 'office', 'rent', 'marketing', 'insurance', 'taxes'];
  const periodTypes = ['Monthly', 'Quarterly', 'Yearly'];
  const budgetNotes = {
      fuel: ['Fleet fuel', 'Operational transport costs'],
      maintenance: ['Vehicle upkeep', 'Equipment servicing'],
      salaries: ['Staff compensation', 'Payroll allocation'],
      // ... add more notes for other categories
  };

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
      for (const periodType of periodTypes) {
          let periodsInYear = 1;
          if (periodType === 'Monthly') periodsInYear = 12;
          if (periodType === 'Quarterly') periodsInYear = 4;

          for (let periodIndex = 0; periodIndex < periodsInYear; periodIndex++) {
              let periodStartDate, periodEndDate;

              if (periodType === 'Monthly') {
                  periodStartDate = new Date(year, periodIndex, 1);
                  periodEndDate = new Date(year, periodIndex + 1, 0);
              } else if (periodType === 'Quarterly') {
                  periodStartDate = new Date(year, periodIndex * 3, 1);
                  periodEndDate = new Date(year, periodIndex * 3 + 3, 0);
              } else { // Yearly
                  periodStartDate = new Date(year, 0, 1);
                  periodEndDate = new Date(year, 11, 31);
              }

              // Skip if the period is entirely before the seed start date or entirely after the seed end date
              if (periodEndDate < startDate || periodStartDate > endDate) {
                  continue;
              }
              // Adjust start/end dates if they partially overlap the seed range
              if (periodStartDate < startDate) periodStartDate = startDate;
              if (periodEndDate > endDate) periodEndDate = endDate;

              for (const category of categories) {
                  // Base allocation slightly higher than average random expense for that category
                  const baseAllocation = {
                      fuel: 600, maintenance: 700, salaries: 4000, utilities: 500, equipment: 1200,
                      office: 200, rent: 2000, marketing: 800, insurance: 1000, taxes: 1500
                  }[category] || 500; // Default base

                  let multiplier = 1;
                  if (periodType === 'Quarterly') multiplier = 3;
                  if (periodType === 'Yearly') multiplier = 12;

                  // Add variability (+/- 20%)
                  const allocatedAmount = Math.round(baseAllocation * multiplier * (0.8 + Math.random() * 0.4));

                  budgets.push({
                      category,
                      periodType,
                      periodStartDate: new Date(periodStartDate),
                      periodEndDate: new Date(periodEndDate),
                      allocatedAmount,
                      notes: randomElement(budgetNotes[category] || [`Budget for ${category}`]),
                      createdBy: financialManager._id
                  });
              }
          }
      }
  }

  if (budgets.length > 0) {
      await Budget.insertMany(budgets);
  }
  console.log(`Generated ${await Budget.countDocuments()} budgets.`);
}

async function ensurePayrollAndAttendance(staffUsers, startDate, endDate) {
  console.log(`Generating payroll & attendance from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
  await PayrollLog.deleteMany({});
  await Attendance.deleteMany({});
  const payrollLogs = [];
  const attendanceRecords = [];
  const attendanceStatuses = ['Present', 'Absent', 'Late', 'On Leave', 'Half-day'];

  for (const staff of staffUsers) {
    let monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (monthStart <= endDate) {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const actualMonthEnd = monthEnd > endDate ? endDate : monthEnd; // Cap at seed end date

      // Determine status based on model enum and DEMO_CURRENT_DATE
      let payrollStatus;
      if (actualMonthEnd > DEMO_CURRENT_DATE) {
          payrollStatus = 'Pending Calculation'; // Future logs are pending calculation
      } else {
          // Past/Present logs: Mostly Paid, some Pending Payment
          const randomStatus = Math.random();
          if (randomStatus < 0.8) payrollStatus = 'Paid'; // 80% Paid
          else payrollStatus = 'Pending Payment'; // 20% Pending Payment
      }

      // PayrollLog (one per staff per month)
      const baseSalary = randomNumber(2000, 4000);
      const hoursWorked = randomNumber(150, 170);
      const overtimeHours = randomNumber(0, 15);
      const overtimeRate = randomNumber(15, 25);
      const bonusAmount = Math.random() < 0.1 ? randomNumber(50, 300) : 0;
      const deductions = [
          { name: 'Tax', amount: randomNumber(100, 400) }, // Use 'name' instead of 'label'
          { name: 'Insurance', amount: randomNumber(50, 150) } // Use 'name' instead of 'label'
      ];
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      const netPay = baseSalary + (overtimeHours * overtimeRate) + bonusAmount - totalDeductions;

      payrollLogs.push({
        staff: staff._id,
        payPeriodStart: new Date(monthStart),
        payPeriodEnd: new Date(actualMonthEnd),
        baseSalary: baseSalary,
        hoursWorked: hoursWorked,
        overtimeHours: overtimeHours,
        overtimeRate: overtimeRate,
        bonusAmount: bonusAmount,
        deductions: deductions,
        status: payrollStatus, // Use corrected status enum
        netPay: Math.max(0, netPay), // Ensure netPay is not negative
        paymentDate: payrollStatus === 'Paid' ? addDays(actualMonthEnd, randomNumber(1, 5)) : null, // Set payment date if Paid
        generatedDate: new Date(actualMonthEnd), // Assume generated at period end
      });

      // Attendance (simulate weekdays within the month)
      let dayRunner = new Date(monthStart);
      while (dayRunner <= actualMonthEnd) {
        const dayOfWeek = dayRunner.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends (Sunday=0, Saturday=6)
          const status = randomElement(attendanceStatuses);
          let checkInTime = null;
          let checkOutTime = null;
          let notes = '';

          // Only create an attendance record if the status implies attendance
          if (status === 'Present' || status === 'Late' || status === 'Half-day') {
            const startHour = (status === 'Late') ? randomNumber(8, 9) : 8; // Late starts 8-9, others 8
            const startMinute = randomNumber(0, 59);
            checkInTime = new Date(dayRunner);
            checkInTime.setHours(startHour, startMinute, 0, 0);

            let endHour, endMinute;
            if (status === 'Half-day') {
                endHour = startHour + 4; // Approx 4 hours later
                endMinute = randomNumber(0, 59);
                notes = 'Left early for appointment.';
            } else {
                endHour = randomNumber(16, 17); // End between 4 PM and 5 PM
                endMinute = randomNumber(0, 59);
            }
            checkOutTime = new Date(dayRunner);
            checkOutTime.setHours(endHour, endMinute, 0, 0);

            // Ensure checkout is after checkin
            if (checkOutTime <= checkInTime) {
                 checkOutTime = addHours(checkInTime, status === 'Half-day' ? 4 : 8);
                 checkOutTime.setMinutes(randomNumber(0, 59));
            }

            attendanceRecords.push({
              staff: staff._id,
              date: new Date(dayRunner), // Just the date part
              checkInTime: checkInTime, // Will not be null here
              checkOutTime: checkOutTime,
              status: status,
              notes: notes,
              // totalHours will be calculated by backend/model
            });
          } else if (status === 'On Leave') {
            // Optionally log leave days elsewhere if needed, but don't create Attendance doc
            // console.log(`Staff ${staff.email} on leave on ${dayRunner.toDateString()}`);
          } else { // Absent
            // Optionally log absences elsewhere, but don't create Attendance doc
            // console.log(`Staff ${staff.email} absent on ${dayRunner.toDateString()}`);
          }
        }
        dayRunner = addDays(dayRunner, 1);
      }

      monthStart = addMonths(monthStart, 1);
    }
  }

  if (payrollLogs.length > 0) {
      await PayrollLog.insertMany(payrollLogs);
  }
  if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
  }
  console.log(`Generated ${await PayrollLog.countDocuments()} payroll logs.`);
  console.log(`Generated ${await Attendance.countDocuments()} attendance records.`);
}

// Utility to add hours, handling date changes
function addHours(date, hours) {
    const result = new Date(date);
    result.setTime(result.getTime() + hours * 60 * 60 * 1000);
    return result;
}

async function ensurePerformance(staffUsers, adminUser, startDate, endDate) {
  console.log(`Generating performance reviews from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
  await Performance.deleteMany({});
  const reviews = [];
  const feedbackComments = [
      'Exceeds expectations in all areas.', 'Consistently meets expectations.', 'Solid performance, room for growth in communication.',
      'Needs improvement in meeting deadlines.', 'Excellent teamwork and initiative.', 'Requires more attention to detail.'
  ];
  const goalsList = [
      ['Improve productivity by 10%'], ['Complete project X on time'], ['Enhance communication skills'],
      ['Learn new technology Y'], ['Mentor junior staff member'], ['Reduce errors in reports']
  ];

  for (const staff of staffUsers) {
    // Generate reviews quarterly
    let reviewPeriodStart = new Date(startDate.getFullYear(), Math.floor(startDate.getMonth() / 3) * 3, 1); // Start of the quarter

    while (reviewPeriodStart <= endDate) {
      const reviewPeriodEnd = addMonths(reviewPeriodStart, 3);
      const actualReviewPeriodEnd = reviewPeriodEnd > endDate ? endDate : new Date(reviewPeriodEnd - 1); // End of the quarter, capped at seed end date

      // Only create review if the period has passed relative to DEMO_CURRENT_DATE
      if (actualReviewPeriodEnd <= DEMO_CURRENT_DATE) {
          const productivity = randomNumber(3, 5); // Scale 1-5
          const quality = randomNumber(3, 5);
          const reliability = randomNumber(3, 5);
          const communication = randomNumber(3, 5);
          const initiative = randomNumber(3, 5);
          const overallRating = parseFloat(((productivity + quality + reliability + communication + initiative) / 5).toFixed(1)); // Average rating

          reviews.push({
            staff: staff._id,
            reviewPeriod: { startDate: new Date(reviewPeriodStart), endDate: new Date(actualReviewPeriodEnd) },
            metrics: { productivity, quality, reliability, communication, initiative },
            overallRating: overallRating,
            feedback: randomElement(feedbackComments),
            goals: randomElement(goalsList),
            reviewer: adminUser._id, // Assume admin does reviews
            reviewDate: addDays(actualReviewPeriodEnd, randomNumber(1, 10)), // Review happens shortly after period ends
            createdAt: addDays(actualReviewPeriodEnd, randomNumber(1, 10)), // Align createdAt with reviewDate
            updatedAt: addDays(actualReviewPeriodEnd, randomNumber(1, 10)),
          });
      }
      reviewPeriodStart = reviewPeriodEnd; // Move to the start of the next quarter
    }
  }

  if (reviews.length > 0) {
      await Performance.insertMany(reviews);
  }
  console.log(`Generated ${await Performance.countDocuments()} performance reviews.`);
}

async function ensureComplaints(customers, staffUsers, adminUser, startDate, endDate) {
  console.log(`Generating complaints from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
  await Complaint.deleteMany({});
  const complaints = [];
  const subjects = [
      'Missed pickup', 'Billing inquiry', 'Damaged bin', 'Service request', 'Website issue',
      'Staff behavior', 'Recycling confusion', 'Subscription change request', 'Payment issue'
  ];
  // Corrected statuses to match the Complaint model enum
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const staffAndAdmin = [...staffUsers, adminUser]; // Combine for assignment

  const numComplaints = customers.length * 2; // Generate ~2 complaints per customer over the period

  for (let i = 0; i < numComplaints; i++) {
      const customer = randomElement(customers);
      const createdAt = randomDate(startDate, endDate);
      let status;
      let resolvedAt = null;
      let assignedAdmin = null;

      // Determine status based on creation date relative to DEMO_CURRENT_DATE
      const daysSinceCreation = (DEMO_CURRENT_DATE - createdAt) / (1000 * 60 * 60 * 24);

      // Use 'Open' instead of 'New'
      if (daysSinceCreation < 2) status = 'Open'; // Created very recently
      else if (daysSinceCreation < 7) status = randomElement(['Open', 'In Progress']); // Within a week
      else if (daysSinceCreation < 30) status = randomElement(['In Progress', 'Resolved']); // Within a month
      else status = randomElement(['Resolved', 'Closed']); // Older complaints

      if (status === 'Resolved' || status === 'Closed') {
          resolvedAt = addDays(createdAt, randomNumber(1, 30)); // Resolved/Closed within 30 days
          if (resolvedAt > DEMO_CURRENT_DATE) resolvedAt = DEMO_CURRENT_DATE; // Cap resolution date
      }

      // Assign admin/staff more often if not Open
      if (status !== 'Open' && staffAndAdmin.length > 0) {
          assignedAdmin = randomElement(staffAndAdmin)._id;
      }

      // Ensure financial complaints exist for the manager dashboard
      let subject = randomElement(subjects);
      if (Math.random() < 0.2) { // 20% chance of being a financial complaint
          subject = randomElement(['Billing Issue', 'Payment Problem', 'Subscription Query']);
      }

      complaints.push({
          user: customer._id,
          subject: subject,
          description: `Seeded complaint about ${subject}. User ${customer.name} reported on ${createdAt.toLocaleDateString()}. Needs attention.`,
          status: status,
          createdAt: new Date(createdAt),
          updatedAt: resolvedAt || new Date(createdAt), // Update time is resolution time or creation time
          resolvedAt: resolvedAt,
          assignedAdmin: assignedAdmin,
      });
  }

  if (complaints.length > 0) {
      await Complaint.insertMany(complaints);
  }
  console.log(`Generated ${await Complaint.countDocuments()} complaints.`);
}

async function ensureDocuments(users, startDate, endDate) {
  console.log(`Generating documents from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
  await Document.deleteMany({});
  const documents = [];
  // Corrected docTypes to match the Document model enum
  const docTypes = ['ID Card', 'Utility Bill', 'Driver License', 'Passport', 'Other'];
  const allUsers = await User.find({}); // Include staff, admin etc. for document assignment

  const numDocs = allUsers.length * 3; // ~3 docs per user

  for (let i = 0; i < numDocs; i++) {
      const user = randomElement(allUsers);
      const uploadedAt = randomDate(startDate, endDate);
      const docType = randomElement(docTypes);
      // Use 'name' instead of 'fileName'
      const docName = `${docType.replace(/\s+/g, '_')}_${user.name.replace(/\s+/g, '_')}_${uploadedAt.toISOString().split('T')[0]}.pdf`;

      // Simulate verification status based on upload date
      let verificationStatus = 'Pending';
      const daysSinceUpload = (DEMO_CURRENT_DATE - uploadedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceUpload > 14) verificationStatus = randomElement(['Verified', 'Rejected']); // Older docs likely processed
      else if (daysSinceUpload > 3) verificationStatus = randomElement(['Pending', 'Verified']); // Medium age

      const verificationDate = verificationStatus === 'Verified' || verificationStatus === 'Rejected' ? addDays(uploadedAt, randomNumber(1, 14)) : null;
      const verifiedBy = verificationStatus === 'Verified' || verificationStatus === 'Rejected' ? randomElement(allUsers.filter(u => u.role === 'admin' || u.role === 'financial_manager'))?._id : null;
      // Use 'verificationNotes' instead of 'notes'
      const verificationNotes = verificationStatus === 'Rejected' ? 'Document unclear or invalid.' : '';

      documents.push({
          user: user._id,
          name: docName, // Use 'name'
          filePath: `/uploads/documents/${docName}`, // Simulated path using docName
          mimeType: 'application/pdf', // Use 'mimeType' instead of 'fileType'
          size: randomNumber(10000, 2000000), // Add random size (10KB - 2MB)
          type: docType, // Use 'type' instead of 'documentType'
          uploadedAt: new Date(uploadedAt),
          verificationStatus: verificationStatus,
          verifiedBy: verifiedBy,
          verificationDate: verificationDate,
          verificationNotes: verificationNotes, // Use 'verificationNotes'
      });
  }

  if (documents.length > 0) {
      await Document.insertMany(documents);
  }
  console.log(`Generated ${await Document.countDocuments()} documents.`);
}

// --- Resource Seeder Functions ---
async function ensureEquipment() {
  console.log('Seeding equipment...');
  
  // Use mongoose direct collection access instead of model imports
  const Equipment = mongoose.connection.collection('equipment');
  
  // Clear existing data
  await Equipment.deleteMany({});
  
  const equipmentList = [
    {
      equipmentId: 'EQP001',
      type: 'Gloves',
      description: 'Heavy-duty protective gloves',
      location: { lat: 6.9271, lng: 79.8612 }
    },
    {
      equipmentId: 'EQP002',
      type: 'Boots',
      description: 'Waterproof safety boots',
      location: { lat: 6.9275, lng: 79.8620 }
    },
    {
      equipmentId: 'EQP003',
      type: 'Safety Dress',
      description: 'Reflective safety dress for night work',
      location: { lat: 6.9280, lng: 79.8600 }
    }
  ];
  
  // Insert directly to collection
  await Equipment.insertMany(equipmentList);
  console.log(`Seeded ${await Equipment.countDocuments()} equipment items.`);
}

async function ensureTrucks() {
  console.log('Seeding trucks...');
  
  // Use mongoose direct collection access
  const Truck = mongoose.connection.collection('trucks');
  
  // Clear existing data
  await Truck.deleteMany({});
  
  const truckList = [
    {
      truckId: 'TRK001',
      status: 'Active',
      tankCapacity: 5000,
      availability: 'Available',
      fuel: 80,
      condition: 'Good',
      description: 'Main waste collection truck',
      location: { lat: 6.9271, lng: 79.8612 }
    },
    {
      truckId: 'TRK002',
      status: 'Active',
      tankCapacity: 4000,
      availability: 'Available',
      fuel: 60,
      condition: 'Good',
      description: 'Backup truck for city routes',
      location: { lat: 6.9275, lng: 79.8620 }
    },
    {
      truckId: 'TRK003',
      status: 'Active',
      tankCapacity: 3500,
      availability: 'Available',
      fuel: 90,
      condition: 'Repair',
      description: 'Truck under maintenance',
      location: { lat: 6.9280, lng: 79.8600 }
    }
  ];
  
  await Truck.insertMany(truckList);
  console.log(`Seeded ${await Truck.countDocuments()} trucks.`);
}

async function ensureTools() {
  console.log('Seeding tools...');
  
  // Use mongoose direct collection access
  const Tool = mongoose.connection.collection('tools');
  
  // Clear existing data
  await Tool.deleteMany({});
  
  const toolList = [
    {
      toolId: 'T001',
      type: 'Shovel',
      status: 'Available',
      description: 'Standard metal shovel for waste handling'
    },
    {
      toolId: 'T002',
      type: 'Broom',
      status: 'Available',
      description: 'Heavy-duty broom for street cleaning'
    },
    {
      toolId: 'T003',
      type: 'Rake',
      status: 'Available',
      description: 'Rake for collecting leaves and debris'
    }
  ];
  
  await Tool.insertMany(toolList);
  console.log(`Seeded ${await Tool.countDocuments()} tools.`);
}

async function ensureSchedules() {
  console.log('Seeding schedules...');
  
  // Use mongoose direct collection access
  const Schedule = mongoose.connection.collection('schedules');
  
  // Clear existing data
  await Schedule.deleteMany({});
  
  const scheduleList = [
    {
      scheduleNo: 'SCH001',
      route: ['Colombo 01', 'Colombo 02', 'Colombo 03'],
      truckNo: 'TRK001',
      date: '2025-05-01',
      time: '08:00',
      status: 'Waiting'
    },
    {
      scheduleNo: 'SCH002',
      route: ['Colombo 04', 'Colombo 05'],
      truckNo: 'TRK002',
      date: '2025-05-02',
      time: '09:00',
      status: 'Pending'
    },
    {
      scheduleNo: 'SCH003',
      route: ['Colombo 06', 'Colombo 07'],
      truckNo: 'TRK003',
      date: '2025-05-03',
      time: '10:00',
      status: 'Completed'
    }
  ];
  
  await Schedule.insertMany(scheduleList);
  console.log(`Seeded ${await Schedule.countDocuments()} schedules.`);
}

// Main Seeding Function
async function seedDatabase(startDate, endDate) {
  try {
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = config.mongodbUri;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not configured in config/index.js or .env file.");
    }
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected.');
    console.log(`Seeding data from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log(`Relative to DEMO_CURRENT_DATE: ${DEMO_CURRENT_DATE.toDateString()}`);

    // 1. Clear existing data
    await cleanSlate();

    // 2. Ensure base data exists (Users, Plans)
    const coreUsers = await ensureUsers(); // Gets admin, finance, staff, customer
    const allPlans = await ensurePlans();

    // Fetch all users needed for seeding different collections
    const customers = await User.find({ role: 'customer' });
    const staffUsers = await User.find({ role: 'staff' });
    const adminUser = coreUsers.admin;
    const financialManager = coreUsers.financial_manager;

    if (!financialManager) {
        console.error("CRITICAL: Financial Manager user not found or created. Aborting seed.");
        return;
    }
     if (!adminUser) {
        console.error("CRITICAL: Admin user not found or created. Aborting seed.");
        return;
    }
    if (customers.length === 0) {
        console.error("CRITICAL: No customer users found or created. Aborting seed.");
        return;
    }
     if (staffUsers.length === 0) {
        console.warn("Warning: No staff users found or created. Some features might lack data (Payroll, Attendance, Performance).");
    }

    // 3. Seed transactional data using the date range
    await ensureSubscriptions(customers, allPlans, startDate, endDate);
    await ensurePayments(customers, allPlans, startDate, endDate); // Pass customers for standalone payments
    await ensureExpenses(financialManager, startDate, endDate);
    await ensureBudgets(financialManager, startDate, endDate);

    if (staffUsers.length > 0) {
        await ensurePayrollAndAttendance(staffUsers, startDate, endDate);
        await ensurePerformance(staffUsers, adminUser, startDate, endDate);
    }

    await ensureComplaints(customers, staffUsers, adminUser, startDate, endDate);
    await ensureDocuments([...customers, ...staffUsers, adminUser, financialManager], startDate, endDate); // Seed docs for all user types

    // --- Resource seeding ---
    await ensureEquipment();
    await ensureTrucks();
    await ensureTools();
    await ensureSchedules();

    console.log('\n--- Database Seeding Completed Successfully ---');

  } catch (error) {
    console.error('\n--- Error during database seeding ---');
    console.error(error);
    process.exit(1); // Exit with error code
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  }
}

// Execute the seeding process
seedDatabase(SEED_START_DATE, DEMO_CURRENT_DATE);
