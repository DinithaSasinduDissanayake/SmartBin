import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import
import styles from './ScheduleDisplay.module.css';

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
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th>Schedule No</th>
            <th>Truck No</th>
            <th>Date</th>
            <th>Time</th>
            <th>Route</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.map((s) => (
            <tr key={s._id}>
              <td>{s.scheduleNo}</td>
              <td>{s.truckNo}</td>
              <td>{s.date}</td>
              <td>{s.time}</td>
              <td>{s.route.join(', ')}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDisplay;