import React, { useState } from 'react';

const RecycleForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    wasteType: 'Glass',
    quantity: '',
    community: '',
    pickupLocation: '',
    preferredPickupDateTime: '',
    collectionPreference: 'Delivery',
    amount: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/recycling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      if (onSuccess) onSuccess();
      setFormData({
        name: '', email: '', contact: '', wasteType: 'Glass', quantity: '', community: '', pickupLocation: '', preferredPickupDateTime: '', collectionPreference: 'Delivery', amount: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Submit Recycling Request</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" required />
      <select name="wasteType" value={formData.wasteType} onChange={handleChange} required>
        <option value="Glass">Glass</option>
        <option value="Plastic">Plastic</option>
        <option value="Paper">Paper</option>
      </select>
      <input name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity (kg)" required type="number" min="1" />
      <input name="community" value={formData.community} onChange={handleChange} placeholder="Community" required />
      <input name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} placeholder="Pickup Location" required />
      <input name="preferredPickupDateTime" value={formData.preferredPickupDateTime} onChange={handleChange} placeholder="Pickup DateTime" required type="datetime-local" />
      <select name="collectionPreference" value={formData.collectionPreference} onChange={handleChange} required>
        <option value="Delivery">Delivery</option>
        <option value="Self-pickup">Self-pickup</option>
      </select>
      <input name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount (LKR)" required type="number" min="0" />
      <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
    </form>
  );
};

export default RecycleForm;
