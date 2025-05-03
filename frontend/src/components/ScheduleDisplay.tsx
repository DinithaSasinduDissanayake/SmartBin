import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import

const ScheduleDisplay: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]); // Filtered schedules state එක add කළා
  const [searchTerm, setSearchTerm] = useState(''); // Search term state එක add කළා

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/schedules');
      setSchedules(response.data);
      setFilteredSchedules(response.data); // Initial load වෙද්දි filteredSchedules එකත් set කරන්න්
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  // Search functionality implement කළා
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = schedules.filter(
      (schedule) =>
        schedule.scheduleNo.toLowerCase().includes(term) ||
        schedule.truckNo.toLowerCase().includes(term) ||
        schedule.route.some((r: string) => r.toLowerCase().includes(term))
    );
    setFilteredSchedules(filtered);
  };

  return (
    <div>
      <h2>Schedule Display</h2>
      {/* Search bar add කළා */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Schedule No, Truck No, or Route..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>
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
    </div>
  );
};

export default ScheduleDisplay;