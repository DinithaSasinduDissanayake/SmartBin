import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import

const ScheduleManagement: React.FC = () => {
  const [schedule, setSchedules] = useState({
    scheduleNo: '',
    truckNo: '',
    date: '',
    time: '',
    route: [] as string[],
    status: 'Pending',
  });
  const [schedules, setScheduleList] = useState<any[]>([]);
  const [routeInput, setRouteInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [availableTrucks, setAvailableTrucks] = useState<string[]>([]); // Available trucks store 

  useEffect(() => {
    fetchSchedules();
    fetchAvailableTrucks(); // Available trucks fetch 
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/schedules');
      setScheduleList(response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  // Available trucks fetch 
  const fetchAvailableTrucks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trucks');
      const trucks = response.data;
      // Filter trucks where availability is "Available"
      const available = trucks
        .filter((truck: any) => truck.availability === 'Available')
        .map((truck: any) => truck.truckId);
      setAvailableTrucks(available);
    } catch (err) {
      console.error('Failed to fetch trucks:', err);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!schedule.scheduleNo) newErrors.scheduleNo = 'Schedule No is required';
    if (!schedule.truckNo) newErrors.truckNo = 'Truck No is required';
    if (!schedule.date) newErrors.date = 'Date is required';
    if (!schedule.time) newErrors.time = 'Time is required';
    if (schedule.route.length === 0) newErrors.route = 'At least one route is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRoute = () => {
    if (routeInput.trim()) {
      setSchedules({ ...schedule, route: [...schedule.route, routeInput.trim()] });
      setRouteInput('');
    }
  };

  const handleRemoveRoute = (index: number) => {
    const newRoute = schedule.route.filter((_, i) => i !== index);
    setSchedules({ ...schedule, route: newRoute });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/schedules/${editingId}`, schedule);
        alert('Schedule updated successfully!');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/schedules', schedule);
        alert('Schedule added successfully!');
      }
      setSchedules({ scheduleNo: '', truckNo: '', date: '', time: '', route: [], status: 'Pending' });
      setErrors({});
      fetchSchedules();
    } catch (err) {
      alert('Error: ' + (err as any).response.data.error);
    }
  };

  const handleEdit = (s: any) => {
    setSchedules(s);
    setEditingId(s._id);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/schedules/${id}`);
      alert('Schedule deleted successfully!');
      fetchSchedules();
    } catch (err) {
      alert('Error: ' + (err as any).response.data.error);
    }
  };

  return (
    <div>
      <h2>Schedule Management</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label><span className="form-label">Schedule No</span></label>
          <input
            type="text"
            value={schedule.scheduleNo}
            onChange={(e) => setSchedules({ ...schedule, scheduleNo: e.target.value })}
          />
          {errors.scheduleNo && <span className="error">{errors.scheduleNo}</span>}
        </div>
        <div>
          <label><span className="form-label">Truck No</span></label>
          {/* Truck field  dropdown  update */}
          <select
            value={schedule.truckNo}
            onChange={(e) => setSchedules({ ...schedule, truckNo: e.target.value })}
          >
            <option value="">Select a Truck</option>
            {availableTrucks.map((truckId) => (
              <option key={truckId} value={truckId}>
                {truckId}
              </option>
            ))}
          </select>
          {errors.truckNo && <span className="error">{errors.truckNo}</span>}
        </div>
        <div>
          <label><span className="form-label">Date</span></label>
          <input
            type="date"
            value={schedule.date}
            onChange={(e) => setSchedules({ ...schedule, date: e.target.value })}
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>
        <div>
          <label><span className="form-label">Time</span></label>
          <input
            type="time"
            value={schedule.time}
            onChange={(e) => setSchedules({ ...schedule, time: e.target.value })}
          />
          {errors.time && <span className="error">{errors.time}</span>}
        </div>
        <div>
          <label><span className="form-label">Route</span></label>
          <input
            type="text"
            value={routeInput}
            onChange={(e) => setRouteInput(e.target.value)}
          />
          <button type="button" onClick={handleAddRoute}>Add Route</button>
          {errors.route && <span className="error">{errors.route}</span>}
          <ul>
            {schedule.route.map((r, index) => (
              <li key={index}>
                {r} <button type="button" onClick={() => handleRemoveRoute(index)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label><span className="form-label">Status</span></label>
          <select
            value={schedule.status}
            onChange={(e) => setSchedules({ ...schedule, status: e.target.value })}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit">{editingId ? 'Update Schedule' : 'Add Schedule'}</button>
      </form>
      <h3>Added Schedules</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3a3a3a' }}>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Schedule No</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Truck No</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Date</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Time</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Route</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Actions</th>
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
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>
                <button onClick={() => handleEdit(s)} style={{ marginRight: '10px' }}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleManagement;