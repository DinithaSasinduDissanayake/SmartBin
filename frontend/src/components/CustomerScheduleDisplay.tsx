import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import '../styles/custom.css';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import

const CustomerScheduleDisplay: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('scheduleNo'); // Default search type

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customer-schedules');
      setSchedules(response.data);
      setFilteredSchedules(response.data);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch schedules: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSchedules(schedules);
    } else {
      const filtered = schedules.filter(schedule => {
        const value = schedule[searchType].toString().toLowerCase();
        return value.includes(searchTerm.toLowerCase());
      });
      setFilteredSchedules(filtered);
    }
  }, [searchTerm, searchType, schedules]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Today's Waste Collection Schedules", 10, 10);
    doc.setFontSize(12);

    let y = 20;
    filteredSchedules.forEach((s, index) => {
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
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select 
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #ffffff' }}
        >
          <option value="scheduleNo">Schedule No</option>
          <option value="truckNo">Truck No</option>
          <option value="date">Date</option>
          <option value="route">Route</option>
          <option value="status">Status</option>
        </select>
        
        <input
          type="text"
          placeholder={`Search by ${searchType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            backgroundColor: '#2a2a2a', 
            color: 'white', 
            border: '1px solid #ffffff',
            flex: 1
          }}
        />
      </div>

      {filteredSchedules.length > 0 ? (
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
              {filteredSchedules.map((s) => (
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
          <button onClick={downloadPDF} className="card-button" style={{ marginTop: '20px' }}>
            Download as PDF
          </button>
        </>
      ) : (
        <div>No schedules found.</div>
      )}
    </div>
  );
};

export default CustomerScheduleDisplay;