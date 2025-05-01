// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import '../styles/UpdateOrder.css';

// const UpdateOrder: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     contact: '',
//     wasteType: 'Glass',
//     quantity: '',
//     community: 'Household',
//     pickupLocation: '',
//     preferredPickupDateTime: '',
//     collectionPreference: 'Delivery',
//     amount: 0,
//   });
//   const [message, setMessage] = useState('');
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [error, setError] = useState<string | null>(null);

//   // Define unit prices for waste types
//   const unitPrices: { [key: string]: number } = {
//     Organic: 150,
//     Glass: 200,
//     Paper: 50,
//     Plastic: 100,
//   };

//   // Calculate amount whenever quantity or wasteType changes
//   useEffect(() => {
//     const quantity = Number(formData.quantity);
//     const unitPrice = unitPrices[formData.wasteType] || 0;
//     const calculatedAmount = quantity > 0 ? quantity * unitPrice : 0;
//     setFormData((prev) => ({ ...prev, amount: calculatedAmount }));
//   }, [formData.quantity, formData.wasteType]);

//   // Fetch the existing order details to pre-fill the form
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/recycling-request/${id}`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log('Fetched order for update:', data);
//         const formattedDate = data.preferredPickupDateTime
//           ? new Date(data.preferredPickupDateTime).toISOString().slice(0, 16)
//           : '';
//         setFormData({
//           name: data.name || '',
//           email: data.email || '',
//           contact: data.contact || '',
//           wasteType: data.wasteType || 'Glass',
//           quantity: data.quantity ? data.quantity.toString() : '',
//           community: data.community || 'Household',
//           pickupLocation: data.pickupLocation || '',
//           preferredPickupDateTime: formattedDate,
//           collectionPreference: data.collectionPreference || 'Delivery',
//           amount: data.amount || 0,
//         });
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching order:', err);
//         setError('Failed to load order details. Please try again.');
//       }
//     };
//     fetchOrder();
//   }, [id]);

//   const today = new Date();
//   const minDateTime = today.toISOString().slice(0, 16);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;

//     if (name === 'name') {
//       if (/^[A-Za-z\s]*$/.test(value)) {
//         setFormData({ ...formData, [name]: value });
//         setErrors({ ...errors, name: '' });
//       } else {
//         setErrors({ ...errors, name: 'Name can only contain letters and spaces' });
//       }
//       return;
//     }

//     if (name === 'contact') {
//       if (/^\d*$/.test(value)) {
//         if (value.length <= 10) {
//           setFormData({ ...formData, [name]: value });
//           if (value.length === 10) {
//             setErrors({ ...errors, contact: '' });
//           } else {
//             setErrors({
//               ...errors,
//               contact: 'Contact number must be exactly 10 digits',
//             });
//           }
//         }
//       } else {
//         setErrors({ ...errors, contact: 'Contact number can only contain numbers' });
//       }
//       return;
//     }

//     if (name === 'quantity') {
//       if (/^\d*$/.test(value)) {
//         const numValue = Number(value);
//         if (value === '' || numValue > 0) {
//           setFormData({ ...formData, [name]: value });
//           setErrors({ ...errors, quantity: '' });
//         } else {
//           setErrors({ ...errors, quantity: 'Quantity must be a positive number' });
//         }
//       } else {
//         setErrors({ ...errors, quantity: 'Quantity must be a number' });
//       }
//       return;
//     }

//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Submitting updated data:', formData);

//     const newErrors: { [key: string]: string } = {};
//     if (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name)) {
//       newErrors.name = 'Name can only contain letters and spaces';
//     }
//     if (!/^\d{10}$/.test(formData.contact)) {
//       newErrors.contact = 'Contact number must be exactly 10 digits';
//     }
//     if (!formData.quantity || Number(formData.quantity) <= 0) {
//       newErrors.quantity = 'Quantity must be a positive number';
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     const dataToSend = {
//       ...formData,
//       quantity: Number(formData.quantity),
//       preferredPickupDateTime: formData.preferredPickupDateTime
//         ? new Date(formData.preferredPickupDateTime).toISOString()
//         : '',
//       amount: formData.amount,
//     };

//     try {
//       const response = await fetch(`http://localhost:5000/api/recycling-request/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(dataToSend),
//       });
//       const data = await response.json();
//       console.log('Response from server:', data);
//       if (response.ok) {
//         setMessage('Order updated successfully');
//         setFormData({
//           name: '',
//           email: '',
//           contact: '',
//           wasteType: 'Glass',
//           quantity: '',
//           community: 'Household',
//           pickupLocation: '',
//           preferredPickupDateTime: '',
//           collectionPreference: 'Delivery',
//           amount: 0,
//         });
//         setErrors({});
//         navigate(`/order-details/${id}`);
//       } else {
//         setMessage(`Error: ${data.message || 'Failed to update order'}`);
//       }
//     } catch (error: any) {
//       console.error('Error updating order:', error);
//       if (error.message.includes('Failed to fetch')) {
//         setMessage(
//           'Error: Could not connect to the server. Please ensure the backend is running on http://localhost:5000.'
//         );
//       } else {
//         setMessage(`Error updating order: ${error.message}`);
//       }
//     }
//   };

//   if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
//   if (!formData.name) return <div style={{ textAlign: 'center' }}>Loading...</div>;

//   return (
//     <div className="recycle-form-container">
//       <h2>Update Order</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="name">Name:</label>
//           <div className="input-wrapper">
//             <input
//               type="text"
//               id="name"
//               name="name"
//               placeholder="Enter your name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//             {errors.name && <span className="error">{errors.name}</span>}
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email:</label>
//           <div className="input-wrapper">
//             <input
//               type="email"
//               id="email"
//               name="email"
//               placeholder="Enter your email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="contact">Contact Number:</label>
//           <div className="input-wrapper">
//             <input
//               type="tel"
//               id="contact"
//               name="contact"
//               placeholder="Enter your contact number"
//               value={formData.contact}
//               onChange={handleChange}
//               required
//               maxLength={10}
//             />
//             {errors.contact && <span className="error">{errors.contact}</span>}
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="wasteType">Waste Type:</label>
//           <div className="input-wrapper">
//             <select
//               id="wasteType"
//               name="wasteType"
//               value={formData.wasteType}
//               onChange={handleChange}
//               required
//             >
//               <option value="Glass">Glass</option>
//               <option value="Plastic">Plastic</option>
//               <option value="Paper">Paper</option>
//               <option value="Organic">Organic</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="quantity">Quantity (kg):</label>
//           <div className="input-wrapper">
//             <input
//               type="text"
//               id="quantity"
//               name="quantity"
//               placeholder="Enter quantity in kg"
//               value={formData.quantity}
//               onChange={handleChange}
//               required
//             />
//             {errors.quantity && <span className="error">{errors.quantity}</span>}
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="amount">Amount (LKR):</label>
//           <div className="input-wrapper">
//             <input
//               type="text"
//               id="amount"
//               name="amount"
//               value={formData.amount.toFixed(2)}
//               readOnly
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="community">Community:</label>
//           <div className="input-wrapper">
//             <select
//               id="community"
//               name="community"
//               value={formData.community}
//               onChange={handleChange}
//               required
//             >
//               <option value="Household">Household</option>
//               <option value="Industry">Industry</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="pickupLocation">Pickup Location:</label>
//           <div className="input-wrapper">
//             <input
//               type="text"
//               id="pickupLocation"
//               name="pickupLocation"
//               placeholder="Enter pickup location"
//               value={formData.pickupLocation}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="preferredPickupDateTime">Preferred Pickup Date & Time:</label>
//           <div className="input-wrapper">
//             <input
//               type="datetime-local"
//               id="preferredPickupDateTime"
//               name="preferredPickupDateTime"
//               value={formData.preferredPickupDateTime}
//               onChange={handleChange}
//               min={minDateTime}
//               required
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label htmlFor="collectionPreference">Collection Preference:</label>
//           <div className="input-wrapper">
//             <select
//               id="collectionPreference"
//               name="collectionPreference"
//               value={formData.collectionPreference}
//               onChange={handleChange}
//               required
//             >
//               <option value="Delivery">Delivery</option>
//               <option value="Self-pickup">Self-pickup</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-group button-group">
//           <button type="submit">Update</button>
//         </div>
//       </form>
//       {message && (
//         <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>
//       )}
//     </div>
//   );
// };

// export default UpdateOrder;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/UpdateOrder.css';

const UpdateOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    wasteType: 'Glass',
    quantity: '',
    community: 'Household',
    pickupLocation: '',
    preferredPickupDateTime: '',
    collectionPreference: 'Delivery',
    amount: 0,
  });
  const [message, setMessage] = useState(''); // For success/error messages
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const unitPrices: { [key: string]: number } = {
    Organic: 150,
    Glass: 200,
    Paper: 50,
    Plastic: 100,
  };

  useEffect(() => {
    const quantity = Number(formData.quantity);
    const unitPrice = unitPrices[formData.wasteType] || 0;
    const calculatedAmount = quantity > 0 ? quantity * unitPrice : 0;
    setFormData((prev) => ({ ...prev, amount: calculatedAmount }));
  }, [formData.quantity, formData.wasteType]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recycling-request/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched order for update:', data);
        const formattedDate = data.preferredPickupDateTime
          ? new Date(data.preferredPickupDateTime).toISOString().slice(0, 16)
          : '';
        setFormData({
          name: data.name || '',
          email: data.email || '',
          contact: data.contact || '',
          wasteType: data.wasteType || 'Glass',
          quantity: data.quantity ? data.quantity.toString() : '',
          community: data.community || 'Household',
          pickupLocation: data.pickupLocation || '',
          preferredPickupDateTime: formattedDate,
          collectionPreference: data.collectionPreference || 'Delivery',
          amount: data.amount || 0,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again.');
      }
    };
    fetchOrder();
  }, [id]);

  const today = new Date();
  const minDateTime = today.toISOString().slice(0, 16);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, name: '' });
      } else {
        setErrors({ ...errors, name: 'Name can only contain letters and spaces' });
      }
      return;
    }

    if (name === 'contact') {
      if (/^\d*$/.test(value)) {
        if (value.length <= 10) {
          setFormData({ ...formData, [name]: value });
          if (value.length === 10) {
            setErrors({ ...errors, contact: '' });
          } else {
            setErrors({
              ...errors,
              contact: 'Contact number must be exactly 10 digits',
            });
          }
        }
      } else {
        setErrors({ ...errors, contact: 'Contact number can only contain numbers' });
      }
      return;
    }

    if (name === 'quantity') {
      if (/^\d*$/.test(value)) {
        const numValue = Number(value);
        if (value === '' || numValue > 0) {
          setFormData({ ...formData, [name]: value });
          setErrors({ ...errors, quantity: '' });
        } else {
          setErrors({ ...errors, quantity: 'Quantity must be a positive number' });
        }
      } else {
        setErrors({ ...errors, quantity: 'Quantity must be a number' });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting updated data:', formData);

    const newErrors: { [key: string]: string } = {};
    if (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = 'Contact number must be exactly 10 digits';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage(''); // Clear any previous message
      return;
    }

    const dataToSend = {
      ...formData,
      quantity: Number(formData.quantity),
      preferredPickupDateTime: formData.preferredPickupDateTime
        ? new Date(formData.preferredPickupDateTime).toISOString()
        : '',
      amount: formData.amount,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/recycling-request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      console.log('Response from server:', data);
      if (response.ok) {
        setMessage('Updated successfully'); // Set the success message
        // Delay navigation to show the message for 2 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            contact: '',
            wasteType: 'Glass',
            quantity: '',
            community: 'Household',
            pickupLocation: '',
            preferredPickupDateTime: '',
            collectionPreference: 'Delivery',
            amount: 0,
          });
          setErrors({});
          setMessage(''); // Clear message before navigating
          navigate(`/order-details/${id}`);
        }, 2000); // 2000ms = 2 seconds
      } else {
        setMessage(`Error: ${data.message || 'Failed to update order'}`);
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      if (error.message.includes('Failed to fetch')) {
        setMessage(
          'Error: Could not connect to the server. Please ensure the backend is running on http://localhost:5000.'
        );
      } else {
        setMessage(`Error updating order: ${error.message}`);
      }
    }
  };

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!formData.name) return <div style={{ textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="recycle-form-container">
      <h2>Update Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact">Contact Number:</label>
          <div className="input-wrapper">
            <input
              type="tel"
              id="contact"
              name="contact"
              placeholder="Enter your contact number"
              value={formData.contact}
              onChange={handleChange}
              required
              maxLength={10}
            />
            {errors.contact && <span className="error">{errors.contact}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="wasteType">Waste Type:</label>
          <div className="input-wrapper">
            <select
              id="wasteType"
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              required
            >
              <option value="Glass">Glass</option>
              <option value="Plastic">Plastic</option>
              <option value="Paper">Paper</option>
              <option value="Organic">Organic</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity (kg):</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="quantity"
              name="quantity"
              placeholder="Enter quantity in kg"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
            {errors.quantity && <span className="error">{errors.quantity}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (LKR):</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount.toFixed(2)}
              readOnly
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="community">Community:</label>
          <div className="input-wrapper">
            <select
              id="community"
              name="community"
              value={formData.community}
              onChange={handleChange}
              required
            >
              <option value="Household">Household</option>
              <option value="Industry">Industry</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pickupLocation">Pickup Location:</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="pickupLocation"
              name="pickupLocation"
              placeholder="Enter pickup location"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="preferredPickupDateTime">Preferred Pickup Date & Time:</label>
          <div className="input-wrapper">
            <input
              type="datetime-local"
              id="preferredPickupDateTime"
              name="preferredPickupDateTime"
              value={formData.preferredPickupDateTime}
              onChange={handleChange}
              min={minDateTime}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="collectionPreference">Collection Preference:</label>
          <div className="input-wrapper">
            <select
              id="collectionPreference"
              name="collectionPreference"
              value={formData.collectionPreference}
              onChange={handleChange}
              required
            >
              <option value="Delivery">Delivery</option>
              <option value="Self-pickup">Self-pickup</option>
            </select>
          </div>
        </div>

        <div className="form-group button-group">
          <button type="submit">Update</button>
          {message && (
            <p style={{ color: message.includes('Error') ? 'red' : 'green', marginTop: '10px', textAlign: 'center' }}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default UpdateOrder;