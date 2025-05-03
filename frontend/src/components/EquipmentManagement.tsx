import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import

interface Equipment {
  _id?: string;
  equipmentId: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
}

const EquipmentManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment>({
    equipmentId: '',
    type: '',
    description: '',
    location: { lat: 6.9271, lng: 79.8612 },
  });
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      setEquipments(response.data);
    } catch (err) {
      console.error('Failed to fetch equipments:', err);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!equipment.equipmentId) newErrors.equipmentId = 'Equipment ID is required';
    if (!equipment.type) newErrors.type = 'Type is required';
    if (!equipment.description) newErrors.description = 'Description is required';
    if (!equipment.location.lat || !equipment.location.lng) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/equipment/${editingId}`, equipment);
        alert('Equipment updated successfully!');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/equipment', equipment);
        alert('Equipment added successfully!');
      }
      setEquipment({ equipmentId: '', type: '', description: '', location: { lat: 6.9271, lng: 79.8612 } });
      setErrors({});
      fetchEquipments();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to add equipment'));
    }
  };

  const handleEdit = (e: Equipment) => {
    setEquipment(e);
    setEditingId(e._id!);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/equipment/${id}`);
      alert('Equipment deleted successfully!');
      fetchEquipments();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to delete equipment'));
    }
  };

  return (
    <div>
      <h2>Equipment Management</h2>
      <form onSubmit={handleSubmit}>
  <div>
    <label><span className="form-label">Equipment ID</span></label>
    <input
      type="text"
      value={equipment.equipmentId}
      onChange={(e) => setEquipment({ ...equipment, equipmentId: e.target.value })}
    />
    {errors.equipmentId && <span className="error">{errors.equipmentId}</span>}
  </div>
  <div>
  <label><span className="form-label">Type</span></label>
  <select
    value={equipment.type}
    onChange={(e) => setEquipment({ ...equipment, type: e.target.value })}
  >
    <option value="">Select Type</option>
    <option value="Gloves">Gloves</option>
    <option value="Boots">Boots</option>
    <option value="Safety Dress">Safety Dress</option>
  </select>
  {errors.type && <span className="error">{errors.type}</span>}
</div>
  <div>
    <label><span className="form-label">Description</span></label>
    <input
      type="text"
      value={equipment.description}
      onChange={(e) => setEquipment({ ...equipment, description: e.target.value })}
    />
    {errors.description && <span className="error">{errors.description}</span>}
  </div>
  <div>
    <label><span className="form-label">Location</span></label>
    <input
      type="number"
      value={equipment.location.lat}
      onChange={(e) => setEquipment({ ...equipment, location: { ...equipment.location, lat: parseFloat(e.target.value) } })}
    />
    <input
      type="number"
      value={equipment.location.lng}
      onChange={(e) => setEquipment({ ...equipment, location: { ...equipment.location, lng: parseFloat(e.target.value) } })}
    />
    {errors.location && <span className="error">{errors.location}</span>}
  </div>
  <button type="submit">{editingId ? 'Update Equipment' : 'Add Equipment'}</button>
</form>
      <h3>Added Equipments</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#3a3a3a' }}>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Equipment ID</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Type</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Description</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Location</th>
            <th style={{ padding: '10px', border: '1px solid #ffffff' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipments.map((e) => (
            <tr key={e._id} style={{ backgroundColor: '#2a2a2a' }}>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{e.equipmentId}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{e.type}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{e.description}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>{`Lat: ${e.location.lat}, Lng: ${e.location.lng}`}</td>
              <td style={{ padding: '10px', border: '1px solid #ffffff' }}>
                <button onClick={() => handleEdit(e)} style={{ marginRight: '10px' }}>Edit</button>
                <button onClick={() => handleDelete(e._id!)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentManagement;