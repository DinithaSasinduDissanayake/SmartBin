import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import FinancialDashboard from './FinancialDashboard';
import financialApi from '../../services/financialApi';

// Mock the financialApi module
jest.mock('../../services/financialApi');

// Mock the context
const mockAuthContext = {
  user: {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'financial_manager'
  },
  loading: false,
  error: null
};

// Sample dashboard data for testing
const mockDashboardData = {
  summary: {
    totalRevenue: 5000,
    totalExpenses: 3000,
    netProfit: 2000,
    activeSubscriptions: 25,
    newSubscriptions: 5
  },
  revenueByPlan: [
    { planName: 'Basic Plan', revenue: 1000, count: 10 },
    { planName: 'Premium Plan', revenue: 4000, count: 15 }
  ],
  expensesByCategory: [
    { category: 'Utilities', total: 1500 },
    { category: 'Rent', total: 1000 },
    { category: 'Supplies', total: 500 }
  ],
  recentTransactions: {
    payments: [
      { id: 'p1', date: '2025-04-01T00:00:00.000Z', customer: 'John Doe', description: 'Monthly subscription', amount: 99, status: 'completed' },
      { id: 'p2', date: '2025-04-02T00:00:00.000Z', customer: 'Jane Smith', description: 'Annual subscription', amount: 999, status: 'completed' }
    ],
    expenses: [
      { id: 'e1', date: '2025-04-03T00:00:00.000Z', category: 'Utilities', description: 'Electricity bill', amount: 200, status: 'paid' },
      { id: 'e2', date: '2025-04-04T00:00:00.000Z', category: 'Rent', description: 'Office rent', amount: 1000, status: 'paid' }
    ]
  },
  trends: {
    revenue: [
      { month: '1', total: 1200 },
      { month: '2', total: 1500 },
      { month: '3', total: 1800 },
      { month: '4', total: 500 }
    ],
    expenses: [
      { month: '1', total: 800 },
      { month: '2', total: 900 },
      { month: '3', total: 1000 },
      { month: '4', total: 300 }
    ]
  },
  subscriptionPlans: [
    { _id: 'plan1', name: 'Basic Plan', price: 9.99, duration: 'Monthly', subscriberCount: 10 },
    { _id: 'plan2', name: 'Premium Plan', price: 99.99, duration: 'Annual', subscriberCount: 15 }
  ]
};

// Helper function to wrap component with context for testing
const renderWithProviders = (ui, { providerProps = {}, ...renderOptions } = {}) => {
  return render(
    <AuthContext.Provider value={{ ...mockAuthContext, ...providerProps }}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthContext.Provider>,
    renderOptions
  );
};

describe('FinancialDashboard Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock the API response
    financialApi.getDashboardData = jest.fn().mockResolvedValue({ 
      data: mockDashboardData 
    });
  });

  test('renders loading state initially', () => {
    renderWithProviders(<FinancialDashboard />);
    expect(screen.getByText(/Loading Financial Dashboard/i)).toBeInTheDocument();
  });

  test('renders dashboard data after loading', async () => {
    renderWithProviders(<FinancialDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading Financial Dashboard/i)).not.toBeInTheDocument();
    });
    
    // Check that key elements are rendered
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/\$5,000\.00/i)).toBeInTheDocument(); // Revenue formatted with currency
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3,000\.00/i)).toBeInTheDocument(); // Expenses formatted with currency
    expect(screen.getByText(/Net Profit/i)).toBeInTheDocument();
    expect(screen.getByText(/\$2,000\.00/i)).toBeInTheDocument(); // Profit formatted with currency
  });

  test('changes date range when selecting different period', async () => {
    renderWithProviders(<FinancialDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading Financial Dashboard/i)).not.toBeInTheDocument();
    });
    
    // Find and click the date range dropdown
    const dateRangeButton = screen.getByText(/This Month/i);
    userEvent.click(dateRangeButton);
    
    // Select "This Year" option
    const yearOption = await screen.findByText(/This Year/i);
    userEvent.click(yearOption);
    
    // Verify API was called with new date range
    expect(financialApi.getDashboardData).toHaveBeenCalledWith('year');
  });

  test('switches to different tabs', async () => {
    renderWithProviders(<FinancialDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading Financial Dashboard/i)).not.toBeInTheDocument();
    });
    
    // Click on the Revenue tab
    const revenueTab = screen.getByRole('tab', { name: /Revenue/i });
    userEvent.click(revenueTab);
    
    // Verify Revenue-specific content is shown
    expect(screen.getByText(/Revenue by Subscription Plan/i)).toBeInTheDocument();
    
    // Click on the Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /Expenses/i });
    userEvent.click(expensesTab);
    
    // Verify Expenses-specific content is shown
    expect(screen.getByText(/Expenses by Category/i)).toBeInTheDocument();
  });

  test('handles API errors correctly', async () => {
    // Mock API error response
    financialApi.getDashboardData.mockRejectedValue({
      response: { data: { message: 'Failed to fetch dashboard data' }}
    });
    
    renderWithProviders(<FinancialDashboard />);
    
    // Wait for error message to show
    await waitFor(() => {
      expect(screen.getByText(/Error Loading Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch dashboard data/i)).toBeInTheDocument();
    });
    
    // Check for retry button
    const retryButton = screen.getByText(/Retry/i);
    expect(retryButton).toBeInTheDocument();
    
    // Click retry and verify API called again
    userEvent.click(retryButton);
    expect(financialApi.getDashboardData).toHaveBeenCalledTimes(2);
  });

  test('handles empty data sets gracefully', async () => {
    // Mock empty dashboard data
    financialApi.getDashboardData.mockResolvedValue({ 
      data: {
        summary: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          activeSubscriptions: 0,
          newSubscriptions: 0
        },
        revenueByPlan: [],
        expensesByCategory: [],
        recentTransactions: { payments: [], expenses: [] },
        trends: { revenue: [], expenses: [] },
        subscriptionPlans: []
      }
    });
    
    renderWithProviders(<FinancialDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading Financial Dashboard/i)).not.toBeInTheDocument();
    });
    
    // Check if "no data" messages are displayed for charts
    expect(screen.getByText(/No revenue or expense data available/i)).toBeInTheDocument();
  });

  test('renders correct data format in financial summary', async () => {
    renderWithProviders(<FinancialDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading Financial Dashboard/i)).not.toBeInTheDocument();
    });
    
    // Check currency formatting in financial summary
    expect(screen.getByText(/\$5,000\.00/i)).toBeInTheDocument(); // Revenue with currency
    expect(screen.getByText(/\$3,000\.00/i)).toBeInTheDocument(); // Expenses with currency
    expect(screen.getByText(/\$2,000\.00/i)).toBeInTheDocument(); // Net Profit with currency
  });
});