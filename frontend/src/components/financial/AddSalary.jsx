import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddSalary.css';

const AddSalary = () => {
  const [formData, setFormData] = useState({
    name: '',
    basicSalary: '',
    bonusPerHour: '',
    deductionPercentage: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/salary-packages', formData);
      navigate('/salary');
    } catch (error) {
      console.error('Error adding salary package:', error);
    }
  };

  return (
    <div className="add-salary-container">
      <h2>Add Salary Package</h2>
      <form onSubmit={handleSubmit}>
        <label>Salary Package Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Basic Salary:</label>
        <input type="text" name="basicSalary" value={formData.basicSalary} onChange={handleChange} required />

        <label>Bonus Per Hour:</label>
        <input type="text" name="bonusPerHour" value={formData.bonusPerHour} onChange={handleChange} required />

        <label>Deduction Percentage:</label>
        <input type="text" name="deductionPercentage" value={formData.deductionPercentage} onChange={handleChange} required />

        <div className="button-group">
          <button type="submit" className="btn save-btn">Save</button>
          <button type="button" className="btn cancel-btn" onClick={() => navigate('/salary')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddSalary;