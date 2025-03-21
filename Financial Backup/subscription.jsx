import React, { useState } from "react";
import "./css/subscription.css";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", feature: "" });
  const [editingIndex, setEditingIndex] = useState(null);

  const openModal = (index = null) => {
    if (index !== null) {
      setFormData(plans[index]);
      setEditingIndex(index);
    } else {
      setFormData({ name: "", price: "", feature: "" });
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.feature) {
      alert("All fields are required");
      return;
    }
    try {
      // Send a POST request to the backend subscribe endpoint.
      const response = await fetch("http://localhost:5000/subscribe", { // adjust the URL and port to match your backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to save subscription plan");
      }
      // If saving succeeds on the backend, update your local state.
      if (editingIndex !== null) {
        const updatedPlans = [...plans];
        updatedPlans[editingIndex] = formData;
        setPlans(updatedPlans);
      } else {
        setPlans([...plans, formData]);
      }
      closeModal();
    } catch (error) {
      console.error(error);
      alert("There was an error saving the subscription plan.");
    }
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      setPlans(plans.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="container">
      <h2>Subscription Plans</h2>
      <button className="btn add-btn" onClick={() => openModal()}>Add Subscription Plan</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Feature</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, index) => (
            <tr key={index}>
              <td>{plan.name}</td>
              <td>{plan.price}</td>
              <td>{plan.feature}</td>
              <td>
                <button className="btn edit-btn" onClick={() => openModal(index)}>Edit</button>
                <button className="btn delete-btn" onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>{editingIndex !== null ? "Edit Subscription Plan" : "Add Subscription Plan"}</h2>
            <form>
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              <label>Price:</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              <label>Feature:</label>
              <input type="text" name="feature" value={formData.feature} onChange={handleChange} required />
              <button type="button" className="btn save-btn" onClick={handleSave}>Save</button>
              <button type="button" className="btn cancel-btn" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
