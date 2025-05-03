import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../variables.css'; // Added import
import '../styles/themeStyles.css'; // Added import

// Tool Management component define කරන්න්
const ToolManagement: React.FC = () => {
  // tools state එක empty array එකක් විදිහට initialize කරන්න්
  const [tools, setTools] = useState<any[]>([]); // any[] use කරනවා මොකද tools එකේ type define කරලා නැහැ
  const [toolId, setToolId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  // Edit mode handle කරන්න states add කළා
  const [isEditing, setIsEditing] = useState(false);
  const [editToolId, setEditToolId] = useState<string | null>(null);

  // Component mount වෙද්දි tools fetch කරන්න්
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tools');
        setTools(response.data); // Fetched data tools state එකට set කරන්න්
      } catch (error) {
        console.error('Error fetching tools:', error);
        setTools([]); // Error එකක් ආවොත් tools එක empty array එකක් විදිහට set කරන්න්
      }
    };
    fetchTools();
  }, []);

  // Form submit කරද්දි new tool එක add කරන්න හෝ existing tool එක update කරන්න්
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editToolId) {
        // Edit mode එකේදී tool එක update කරන්න්
        const response = await axios.put(`http://localhost:5000/api/tools/${editToolId}`, {
          toolId,
          type,
          description,
        });
        setTools(tools.map((tool) => (tool._id === editToolId ? response.data : tool))); // State එක update කරන්න්
        setIsEditing(false); // Edit mode එක off කරන්න්
        setEditToolId(null); // Edit tool ID reset කරන්න්
      } else {
        // Add mode එකේදී new tool එක add කරන්න්
        const response = await axios.post('http://localhost:5000/api/tools', {
          toolId,
          type,
          description,
        });
        setTools([...tools, response.data]); // New tool එක state එකට add කරන්න්
      }
      // Form reset කරන්න්
      setToolId('');
      setType('');
      setDescription('');
    } catch (error) {
      console.error('Error saving tool:', error);
      alert('Failed to save tool');
    }
  };

  // Tool delete කරන්න්
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/tools/${id}`);
      setTools(tools.filter((tool) => tool._id !== id)); // State එක update කරන්න්
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('Failed to delete tool');
    }
  };

  // Edit button click කරද්දි form එක populate කරන්න්
  const handleEdit = (tool: any) => {
    setIsEditing(true);
    setEditToolId(tool._id);
    setToolId(tool.toolId);
    setType(tool.type);
    setDescription(tool.description);
  };

  // Cancel edit mode එක
  const handleCancel = () => {
    setIsEditing(false);
    setEditToolId(null);
    setToolId('');
    setType('');
    setDescription('');
  };

  return (
    <div>
      <h1>Tool Management</h1>
      {/* Tool add/edit කරන්න form එක */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tool ID</label>
          <input
            type="text"
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Type</option>
            <option value="Shovel">Shovel</option>
            <option value="Broom">Broom</option>
            <option value="Rake">Rake</option>
          </select>
        </div>
        <div>
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isEditing ? 'Update Tool' : 'Add Tool'}</button>
        {isEditing && (
          <button type="button" onClick={handleCancel} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        )}
      </form>

      <h2>Added Tools</h2>
     
      <table>
        <thead>
          <tr>
            <th>Tool ID</th>
            <th>Type</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          
          {Array.isArray(tools) && tools.length > 0 ? (
            tools.map((tool) => (
              <tr key={tool._id}>
                <td>{tool.toolId}</td>
                <td>{tool.type}</td>
                <td>{tool.description}</td>
                <td>
                  <button onClick={() => handleEdit(tool)}>Edit</button>
                  <button onClick={() => handleDelete(tool._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No tools available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ToolManagement;