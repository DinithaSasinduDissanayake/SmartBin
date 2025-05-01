import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/MyOrderDetails.css';

const MyOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0); // Add state for calculated amount

  // Define unit prices for waste types
  const unitPrices: { [key: string]: number } = {
    Organic: 150,
    Glass: 200,
    Paper: 50,
    Plastic: 100,
  };

  useEffect(() => {
    console.log('Fetching order with ID:', id);
    fetch(`http://localhost:5000/api/recycling-request/${id}`)
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Order not found in the database');
          }
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched order data:', data);
        setOrder(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching order:', err);
        setError(err.message);
      });
  }, [id]);

  // Calculate amount whenever order data changes
  useEffect(() => {
    if (order) {
      const quantity = Number(order.quantity);
      const unitPrice = unitPrices[order.wasteType] || 0;
      const amount = quantity > 0 ? quantity * unitPrice : 0;
      setCalculatedAmount(amount);
    }
  }, [order]);

  const handleUpdate = () => {
    navigate(`/update-order/${id}`);
  };

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!order) return <div style={{ textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="my-order-details-container">
      <h2>My Order Details</h2>
      <div className="order-details">
        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Contact:</strong> {order.contact}</p>
        <p><strong>Waste Type:</strong> {order.wasteType}</p>
        <p><strong>Quantity (kg):</strong> {order.quantity}</p>
        <p><strong>Amount (LKR):</strong> {calculatedAmount.toFixed(2)}</p> {/* Use calculated amount */}
        <p><strong>Community:</strong> {order.community}</p>
        <p><strong>Pickup Location:</strong> {order.pickupLocation}</p>
        <p><strong>Preferred Pickup Date & Time:</strong> {new Date(order.preferredPickupDateTime).toLocaleString()}</p>
        <p><strong>Collection Preference:</strong> {order.collectionPreference}</p>
        <p><strong>Status:</strong> {order.status || 'Pending'}</p>
      </div>
      <button className="update-btn" onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default MyOrderDetails;