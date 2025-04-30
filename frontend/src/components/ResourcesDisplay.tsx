import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/custom.css';

const ResourcesDisplay: React.FC = () => {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<any[]>([]); // Filtered trucks state එක add කළා
  const [equipments, setEquipments] = useState<any[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<any[]>([]); // Filtered equipments state එක add කළා
  const [tools, setTools] = useState<any[]>([]);
  const [filteredTools, setFilteredTools] = useState<any[]>([]); // Filtered tools state එක add කළා
  const [truckSearchTerm, setTruckSearchTerm] = useState(''); // Truck search term state එක add කළා
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState(''); // Equipment search term state එක add කළා
  const [toolSearchTerm, setToolSearchTerm] = useState(''); // Tool search term state එක add කළා

  useEffect(() => {
    fetchTrucks();
    fetchEquipments();
    fetchTools();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trucks');
      console.log('Trucks response:', response.data);
      setTrucks(response.data);
      setFilteredTrucks(response.data); // Initial load වෙද්දි filteredTrucks එකත් set කරන්න්
    } catch (err) {
      console.error('Failed to fetch trucks:', err);
    }
  };

  const fetchEquipments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      console.log('Equipments response:', response.data);
      setEquipments(response.data);
      setFilteredEquipments(response.data); // Initial load වෙද්දි filteredEquipments එකත් set කරන්න්
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    }
  };

  const fetchTools = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tools');
      console.log('Tool response:', response.data);
      setTools(response.data);
      setFilteredTools(response.data); // Initial load වෙද්දි filteredTools එකත් set කරන්න්
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    }
  };

  // Search functionality for trucks
  const handleTruckSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setTruckSearchTerm(term);

    const filtered = trucks.filter(
      (truck) =>
        truck.truckId.toLowerCase().includes(term) ||
        truck.description.toLowerCase().includes(term)
    );
    setFilteredTrucks(filtered);
  };

  // Search functionality for equipments
  const handleEquipmentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setEquipmentSearchTerm(term);

    const filtered = equipments.filter(
      (equipment) =>
        equipment.equipmentId.toLowerCase().includes(term) ||
        equipment.description.toLowerCase().includes(term)
    );
    setFilteredEquipments(filtered);
  };

  // Search functionality for tools
  const handleToolSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setToolSearchTerm(term);

    const filtered = tools.filter(
      (tool) =>
        tool.toolId.toLowerCase().includes(term) ||
        tool.description.toLowerCase().includes(term)
    );
    setFilteredTools(filtered);
  };

  return (
    <div>
      <h2>Resources Display</h2>

      {/* Trucks Section */}
      <h3>Trucks</h3>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Truck ID or Description..."
          value={truckSearchTerm}
          onChange={handleTruckSearch}
          className="search-bar"
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3a3a3a' }}>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Truck ID</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Tank Capacity</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Availability</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Fuel</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Condition</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Description</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Location</th>
          </tr>
        </thead>
        <tbody>
          {filteredTrucks.map((t) => (
            <tr key={t._id} style={{ backgroundColor: '#2a2a2a' }}>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.truckId}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.tankCapacity}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.availability}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.fuel}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.condition}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.description}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{`Lat: ${t.location.lat}, Lng: ${t.location.lng}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Equipment Section */}
      <h3>Equipment</h3>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Equipment ID or Description..."
          value={equipmentSearchTerm}
          onChange={handleEquipmentSearch}
          className="search-bar"
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3a3a3a' }}>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Equipment ID</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Type</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Description</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Location</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipments.map((eq) => (
            <tr key={eq._id} style={{ backgroundColor: '#2a2a2a' }}>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{eq.equipmentId}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{eq.type}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{eq.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{eq.description}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{`Lat: ${eq.location.lat}, Lng: ${eq.location.lng}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tools Section */}
      <h3>Tools</h3>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Tool ID or Description..."
          value={toolSearchTerm}
          onChange={handleToolSearch}
          className="search-bar"
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3a3a3a' }}>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Tool ID</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredTools.map((t) => (
            <tr key={t._id} style={{ backgroundColor: '#2a2a2a' }}>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.toolId}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourcesDisplay;