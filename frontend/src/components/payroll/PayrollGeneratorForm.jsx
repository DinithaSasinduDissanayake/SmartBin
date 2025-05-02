import React, { useState } from 'react';
import './PayrollComponents.css';

const PayrollGeneratorForm = ({ onGenerate, loading }) => {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate dates
    if (!periodStart || !periodEnd) {
      setError('Both start and end dates are required');
      return;
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    // Call the parent's generate function
    onGenerate(periodStart, periodEnd);
  };

  return (
    <div className="payroll-section">
      <h3>Generate Payroll</h3>
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="payroll-generator-form">
        <div className="form-group">
          <label htmlFor="periodStart">Period Start Date</label>
          <input
            type="date"
            id="periodStart"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="periodEnd">Period End Date</label>
          <input
            type="date"
            id="periodEnd"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn primary"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Payroll'}
        </button>
      </form>
    </div>
  );
};

export default PayrollGeneratorForm;