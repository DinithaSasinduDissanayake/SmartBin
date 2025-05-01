import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import '../styles/custom.css';

const CustomerScheduleDisplay: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customer-schedules');
      console.log('Fetched schedules:', response.data);
      setSchedules(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching schedules:', err.message, err.response?.data);
      setError('Failed to fetch schedules: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Today's Waste Collection Schedules", 10, 10);
    doc.setFontSize(12);

    let y = 20;
    schedules.forEach((s, index) => {
      doc.text(`Schedule ${index + 1}`, 10, y);
      doc.text(`Schedule No: ${s.scheduleNo}`, 10, y + 10);
      doc.text(`Truck No: ${s.truckNo}`, 10, y + 20);
      doc.text(`Date: ${s.date}`, 10, y + 30);
      doc.text(`Time: ${s.time}`, 10, y + 40);
      doc.text(`Route: ${s.route.join(', ')}`, 10, y + 50);
      doc.text(`Status: ${s.status}`, 10, y + 60);
      y += 80;
    });

    doc.save('todays-schedules.pdf');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Today's Waste Collection Schedules</h2>
      {schedules.length > 0 ? (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#3a3a3a' }}>
                <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Schedule No</th>
                <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Truck No</th>
                <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Date</th>
                <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Time</th>
                <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Route</th>
                <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s._id} style={{ backgroundColor: '#2a2a2a' }}>
                  <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{s.scheduleNo}</td>
                  <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{s.truckNo}</td>
                  <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{s.date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{s.time}</td>
                  <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{s.route.join(', ')}</td>
                  <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={downloadPDF} className="card-button">
            Download as PDF
          </button>
        </>
      ) : (
        <div>No schedules for today.</div>
      )}
    </div>
  );
};

export default CustomerScheduleDisplay;