import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import

const containerStyle = {
  width: '100%',
  height: '400px',
};

const ResourceManagement: React.FC = () => {
  const [truck, setTruck] = useState({
    truckId: '',
    status: 'Active',
    tankCapacity: 0,
    availability: 'Available',
    fuel: 0,
    description: '',
    location: { lat: 6.9271, lng: 79.8612 },
  });
  const [trucks, setTrucks] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trucks');
      setTrucks(response.data);
    } catch (err) {
      console.error('Failed to fetch trucks:', err);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    //truck id validation
    if (!truck.truckId) {
      newErrors.truckId = 'Truck ID is required';
    } else if (truck.truckId.length !== 6) {
      newErrors.truckId = 'Truck ID must be exactly 6 characters';
    }
    if (!truck.tankCapacity) newErrors.tankCapacity = 'Tank Capacity is required';
    if (!truck.description) newErrors.description = 'Description is required';
    if (!truck.location.lat || !truck.location.lng) newErrors.location = 'Location is required';
    // Fuel validation 
    if (truck.fuel > truck.tankCapacity) {
      newErrors.fuel = 'Fuel cannot be greater than Tank Capacity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      console.log('Submitting truck:', truck);
      if (editingId) {
        const response = await axios.put(`http://localhost:5000/api/trucks/${editingId}`, truck);
        console.log('Update response:', response.data);
        alert('Truck updated successfully!');
        setEditingId(null);
      } else {
        const response = await axios.post('http://localhost:5000/api/trucks', truck);
        console.log('Add response:', response.data);
        alert('Truck added successfully!');
      }
      setTruck({ truckId: '', status: 'Active', tankCapacity: 0, availability: 'Available', fuel: 0, description: '', location: { lat: 6.9271, lng: 79.8612 } });
      setMapCenter({ lat: 6.9271, lng: 79.8612 });
      setErrors({});
      fetchTrucks();
    } catch (err) {
      console.error('Error submitting truck:', err);
      console.error('Error response:', err.response);
      alert('Error: ' + (err.response?.data?.error || 'Failed to add truck'));
    }
  };

  const handleEdit = (t: any) => {
    setTruck({
      truckId: t.truckId,
      status: t.status,
      tankCapacity: t.tankCapacity,
      availability: t.availability,
      fuel: t.fuel,
      description: t.description,
      location: t.location,
    });
    setMapCenter(t.location);
    setEditingId(t._id);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/trucks/${id}`);
      alert('Truck deleted successfully!');
      fetchTrucks();
    } catch (err) {
      alert('Error: ' + (err as any).response.data.error);
    }
  };

  return (
    <div>
      <h2>Truck Management</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label><span className="form-label">Truck ID</span></label>
          <input
            type="text"
            value={truck.truckId}
            onChange={(e) => setTruck({ ...truck, truckId: e.target.value })}
          />
          {errors.truckId && <span className="error">{errors.truckId}</span>}
        </div>
        <div>
          <label><span className="form-label">Tank Capacity</span></label>
          <input
            type="number"
            value={truck.tankCapacity}
            onChange={(e) => setTruck({ ...truck, tankCapacity: parseInt(e.target.value) })}
          />
          {errors.tankCapacity && <span className="error">{errors.tankCapacity}</span>}
        </div>
        <div>
          <label><span className="form-label">Availability</span></label>
          <select
            value={truck.availability}
            onChange={(e) => setTruck({ ...truck, availability: e.target.value })}
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <label><span className="form-label">Fuel</span></label>
          <input
            type="number"
            value={truck.fuel}
            onChange={(e) => setTruck({ ...truck, fuel: parseInt(e.target.value) })}
          />
          {errors.fuel && <span className="error">{errors.fuel}</span>} {/* Fuel error message display කරන්න් */}
        </div>
        <div>
          <label><span className="form-label">Description</span></label>
          <input
            type="text"
            value={truck.description}
            onChange={(e) => setTruck({ ...truck, description: e.target.value })}
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>
        <div>
          <label><span className="form-label">Location</span></label>
          <input
            type="number"
            value={truck.location.lat}
            onChange={(e) => setTruck({ ...truck, location: { ...truck.location, lat: parseFloat(e.target.value) } })}
          />
          <input
            type="number"
            value={truck.location.lng}
            onChange={(e) => setTruck({ ...truck, location: { ...truck.location, lng: parseFloat(e.target.value) } })}
          />
          {errors.location && <span className="error">{errors.location}</span>}
        </div>
        <button type="submit">{editingId ? 'Update Truck' : 'Add Truck'}</button>
      </form>
      <div className="map-container">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={10}>
            <Marker position={mapCenter} />
          </GoogleMap>
        </LoadScript>
      </div>
      <h3>Added Trucks</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3a3a3a' }}>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Truck ID</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Tank Capacity</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Availability</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Fuel</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Description</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Location</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trucks.map((t) => (
            <tr key={t._id} style={{ backgroundColor: '#2a2a2a' }}>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.truckId}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.tankCapacity}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.availability}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.fuel}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.description}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{`Lat: ${t.location.lat}, Lng: ${t.location.lng}`}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>
                <button onClick={() => handleEdit(t)} style={{ marginRight: '10px' }}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceManagement;