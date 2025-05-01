import React from 'react';
import RequestList from '../components/RequestList';
import '../styles/MyOrders.css';

const MyOrders: React.FC = () => {
  return (
    <div className="my-orders-container">
      <h2>My Orders</h2>
      <RequestList />
    </div>
  );
};

export default MyOrders;