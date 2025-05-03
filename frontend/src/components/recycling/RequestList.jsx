import React, { useEffect, useState } from 'react';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/recycling-requests');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch requests');
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>My Recycling Requests</h2>
      {requests.length === 0 ? (
        <div>No requests found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Waste Type</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Pickup Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.name}</td>
                <td>{req.wasteType}</td>
                <td>{req.quantity}</td>
                <td>{req.status}</td>
                <td>{req.preferredPickupDateTime ? new Date(req.preferredPickupDateTime).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestList;
