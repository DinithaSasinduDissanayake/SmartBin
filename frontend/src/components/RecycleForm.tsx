
// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import '../styles/RecycleForm.css';

// // const RecycleForm: React.FC = () => {
// //   const navigate = useNavigate();
// //   const [formData, setFormData] = useState({
// //     name: '',
// //     email: '',
// //     contact: '',
// //     wasteType: 'Glass',
// //     quantity: '',
// //     community: 'Household',
// //     pickupLocation: '',
// //     preferredPickupDateTime: '',
// //     collectionPreference: 'Delivery',
// //     amount: 0,
// //   });

// //   const [message, setMessage] = useState('');
// //   const [errors, setErrors] = useState<{ [key: string]: string }>({});

// //   // Define unit prices for waste types
// //   const unitPrices: { [key: string]: number } = {
// //     Organic: 150,
// //     Glass: 200,
// //     Paper: 50,
// //     Plastic: 100,
// //   };

// //   // Calculate amount whenever quantity or wasteType changes
// //   useEffect(() => {
// //     const quantity = Number(formData.quantity);
// //     const unitPrice = unitPrices[formData.wasteType] || 0;
// //     const calculatedAmount = quantity > 0 ? quantity * unitPrice : 0;
// //     setFormData((prev) => ({ ...prev, amount: calculatedAmount }));
// //   }, [formData.quantity, formData.wasteType]);

// //   const today = new Date();
// //   const minDateTime = today.toISOString().slice(0, 16);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;

// //     if (name === 'name') {
// //       if (/^[A-Za-z\s]*$/.test(value)) {
// //         setFormData({ ...formData, [name]: value });
// //         setErrors({ ...errors, name: '' });
// //       } else {
// //         setErrors({ ...errors, name: 'Name can only contain letters and spaces' });
// //       }
// //       return;
// //     }

// //     if (name === 'contact') {
// //       if (/^\d*$/.test(value)) {
// //         // Restrict to exactly 10 digits
// //         if (value.length <= 10) {
// //           setFormData({ ...formData, [name]: value });
// //           if (value.length === 10) {
// //             setErrors({ ...errors, contact: '' });
// //           } else {
// //             setErrors({
// //               ...errors,
// //               contact: 'Contact number must be exactly 10 digits',
// //             });
// //           }
// //         }
// //       } else {
// //         setErrors({ ...errors, contact: 'Contact number can only contain numbers' });
// //       }
// //       return;
// //     }

// //     if (name === 'quantity') {
// //       if (/^\d*$/.test(value)) {
// //         const numValue = Number(value);
// //         if (value === '' || numValue > 0) {
// //           setFormData({ ...formData, [name]: value });
// //           setErrors({ ...errors, quantity: '' });
// //         } else {
// //           setErrors({ ...errors, quantity: 'Quantity must be a positive number' });
// //         }
// //       } else {
// //         setErrors({ ...errors, quantity: 'Quantity must be a number' });
// //       }
// //       return;
// //     }

// //     setFormData({ ...formData, [name]: value });
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     console.log('Submitting form data:', formData);

// //     const newErrors: { [key: string]: string } = {};
// //     if (!/^[A-Za-z\s]+$/.test(formData.name)) {
// //       newErrors.name = 'Name can only contain letters and spaces';
// //     }
// //     if (!/^\d{10}$/.test(formData.contact)) {
// //       newErrors.contact = 'Contact number must be exactly 10 digits';
// //     }
// //     if (!formData.quantity || Number(formData.quantity) <= 0) {
// //       newErrors.quantity = 'Quantity must be a positive number';
// //     }

// //     if (Object.keys(newErrors).length > 0) {
// //       setErrors(newErrors);
// //       return;
// //     }

// //     try {
// //       const response = await fetch('http://localhost:5000/api/recycling-request', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(formData),
// //       });
// //       const data = await response.json();
// //       console.log('Response from server:', data);
// //       if (response.ok) {
// //         setMessage('Recycling request submitted successfully');
// //         setFormData({
// //           name: '',
// //           email: '',
// //           contact: '',
// //           wasteType: 'Glass',
// //           quantity: '',
// //           community: 'Household',
// //           pickupLocation: '',
// //           preferredPickupDateTime: '',
// //           collectionPreference: 'Delivery',
// //           amount: 0,
// //         });
// //         setErrors({});
// //       } else {
// //         setMessage(`Error: ${data.message || 'Failed to submit request'}`);
// //       }
// //     } catch (error: any) {
// //       console.error('Error submitting request:', error);
// //       if (error.message.includes('Failed to fetch')) {
// //         setMessage(
// //           'Error: Could not connect to the server. Please ensure the backend is running on http://localhost:5000.'
// //         );
// //       } else {
// //         setMessage(`Error submitting request: ${error.message}`);
// //       }
// //     }
// //   };

// //   const handleAdminClick = () => {
// //     navigate('/admin/dashboard');
// //   };

// //   return (
// //     <div className="recycle-form-container">
// //       <button
// //         onClick={handleAdminClick}
// //         style={{
// //           position: 'absolute',
// //           top: '20px',
// //           right: '20px',
// //           padding: '8px 16px',
// //           backgroundColor: '#3476f1',
// //           color: 'black',
// //           border: 'none',
// //           borderRadius: '5px',
// //           cursor: 'pointer',
// //           zIndex: 1000,
// //         }}
// //       >
// //         Admin
// //       </button>

// //       <h2>Waste Recycle</h2>
// //       <form onSubmit={handleSubmit}>
// //         <div className="form-group">
// //           <label htmlFor="name">Name:</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="text"
// //               id="name"
// //               name="name"
// //               placeholder="Enter your name"
// //               value={formData.name}
// //               onChange={handleChange}
// //               required
// //             />
// //             {errors.name && <span className="error">{errors.name}</span>}
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="email">Email:</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="email"
// //               id="email"
// //               name="email"
// //               placeholder="Enter your email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="contact">Contact Number:</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="tel"
// //               id="contact"
// //               name="contact"
// //               placeholder="Enter your contact number"
// //               value={formData.contact}
// //               onChange={handleChange}
// //               required
// //               maxLength={10} // Restrict input to 10 characters
// //             />
// //             {errors.contact && <span className="error">{errors.contact}</span>}
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="wasteType">Waste Type:</label>
// //           <div className="input-wrapper">
// //             <select
// //               id="wasteType"
// //               name="wasteType"
// //               value={formData.wasteType}
// //               onChange={handleChange}
// //               required
// //             >
// //               <option value="Glass">Glass</option>
// //               <option value="Plastic">Plastic</option>
// //               <option value="Paper">Paper</option>
// //               <option value="Organic">Organic</option>
// //             </select>
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="quantity">Quantity (kg):</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="text"
// //               id="quantity"
// //               name="quantity"
// //               placeholder="Enter quantity in kg"
// //               value={formData.quantity}
// //               onChange={handleChange}
// //               required
// //             />
// //             {errors.quantity && <span className="error">{errors.quantity}</span>}
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="amount">Amount (LKR):</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="text"
// //               id="amount"
// //               name="amount"
// //               value={formData.amount.toFixed(2)}
// //               readOnly
// //             />
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="community">Community:</label>
// //           <div className="input-wrapper">
// //             <select
// //               id="community"
// //               name="community"
// //               value={formData.community}
// //               onChange={handleChange}
// //               required
// //             >
// //               <option value="Household">Household</option>
// //               <option value="Industry">Industry</option>
// //             </select>
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="pickupLocation">Pickup Location:</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="text"
// //               id="pickupLocation"
// //               name="pickupLocation"
// //               placeholder="Enter pickup location"
// //               value={formData.pickupLocation}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="preferredPickupDateTime">Preferred Pickup Date & Time:</label>
// //           <div className="input-wrapper">
// //             <input
// //               type="datetime-local"
// //               id="preferredPickupDateTime"
// //               name="preferredPickupDateTime"
// //               value={formData.preferredPickupDateTime}
// //               onChange={handleChange}
// //               min={minDateTime}
// //               required
// //             />
// //           </div>
// //         </div>

// //         <div className="form-group">
// //           <label htmlFor="collectionPreference">Collection Preference:</label>
// //           <div className="input-wrapper">
// //             <select
// //               id="collectionPreference"
// //               name="collectionPreference"
// //               value={formData.collectionPreference}
// //               onChange={handleChange}
// //               required
// //             >
// //               <option value="Delivery">Delivery</option>
// //               <option value="Self-pickup">Self-pickup</option>
// //             </select>
// //           </div>
// //         </div>

// //         <div className="form-group button-group">
// //           <button type="submit">Submit</button>
// //         </div>
// //       </form>
// //       {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
// //     </div>
// //   );
// // };

// // export default RecycleForm;

// import React, { useState } from 'react';
// import '../styles/RecycleForm.css';

// const RecycleForm: React.FC = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     contact: '',
//     wasteType: '',
//     quantity: '',
//     community: '',
//     pickupLocation: '',
//     preferredPickupDateTime: '',
//     collectionPreference: '',
//   });
//   const [amount, setAmount] = useState<number>(0);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   // Unit prices for waste types (matching AdminRequestDetails.tsx)
//   const unitPrices: { [key: string]: number } = {
//     Organic: 150,
//     Glass: 200,
//     Paper: 50,
//     Plastic: 100,
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     // Calculate amount when wasteType or quantity changes
//     if (name === 'wasteType' || name === 'quantity') {
//       const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity);
//       const wasteType = name === 'wasteType' ? value : formData.wasteType;
//       const unitPrice = unitPrices[wasteType] || 0;
//       const calculatedAmount = quantity > 0 ? quantity * unitPrice : 0;
//       setAmount(calculatedAmount);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     // Validate contact (10 digits)
//     if (!/^\d{10}$/.test(formData.contact)) {
//       setError('Contact number must be exactly 10 digits');
//       return;
//     }

//     // Validate quantity
//     const parsedQuantity = parseFloat(formData.quantity);
//     if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//       setError('Quantity must be a positive number');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/recycling-request', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...formData, amount }),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to submit request');
//       }

//       setSuccess('Recycling request submitted successfully!');
//       setFormData({
//         name: '',
//         email: '',
//         contact: '',
//         wasteType: '',
//         quantity: '',
//         community: '',
//         pickupLocation: '',
//         preferredPickupDateTime: '',
//         collectionPreference: '',
//       });
//       setAmount(0);
//     } catch (err: any) {
//       console.error('Error submitting request:', err);
//       setError(err.message || 'Failed to submit request. Please try again.');
//     }
//   };

//   return (
//     <div className="recycle-form-container">
//       <h2>Submit Recycling Request</h2>
//       {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
//       {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Name:</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Email:</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Contact:</label>
//           <input
//             type="text"
//             name="contact"
//             value={formData.contact}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Waste Type:</label>
//           <select
//             name="wasteType"
//             value={formData.wasteType}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Waste Type</option>
//             <option value="Organic">Organic</option>
//             <option value="Glass">Glass</option>
//             <option value="Plastic">Plastic</option>
//             <option value="Paper">Paper</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <label>Quantity (kg):</label>
//           <input
//             type="number"
//             name="quantity"
//             value={formData.quantity}
//             onChange={handleChange}
//             required
//             min="0.1"
//             step="0.1"
//           />
//         </div>
//         <div className="form-group">
//           <label>Amount (LKR):</label>
//           <input type="text" value={amount.toFixed(2)} readOnly />
//         </div>
//         <div className="form-group">
//           <label>Community:</label>
//           <input
//             type="text"
//             name="community"
//             value={formData.community}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Pickup Location:</label>
//           <input
//             type="text"
//             name="pickupLocation"
//             value={formData.pickupLocation}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Preferred Pickup Date & Time:</label>
//           <input
//             type="datetime-local"
//             name="preferredPickupDateTime"
//             value={formData.preferredPickupDateTime}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label>Collection Preference:</label>
//           <select
//             name="collectionPreference"
//             value={formData.collectionPreference}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Preference</option>
//             <option value="Delivery">Delivery</option>
//             <option value="Self-pickup">Self-pickup</option>
//           </select>
//         </div>
//         <div className="form-group button-group">
//           <button type="submit">Submit Request</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default RecycleForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RecycleForm.css';

const RecycleForm: React.FC = () => {
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

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Define unit prices for waste types
  const unitPrices: { [key: string]: number } = {
    Organic: 150,
    Glass: 200,
    Paper: 50,
    Plastic: 100,
  };

  // Calculate amount whenever quantity or wasteType changes
  useEffect(() => {
    const quantity = Number(formData.quantity);
    const unitPrice = unitPrices[formData.wasteType] || 0;
    const calculatedAmount = quantity > 0 ? quantity * unitPrice : 0;
    setFormData((prev) => ({ ...prev, amount: calculatedAmount }));
  }, [formData.quantity, formData.wasteType]);

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
        // Restrict to exactly 10 digits
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
    console.log('Submitting form data:', formData);

    const newErrors: { [key: string]: string } = {};
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
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
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/recycling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Response from server:', data);
      if (response.ok) {
        setMessage('Recycling request submitted successfully');
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
      } else {
        setMessage(`Error: ${data.message || 'Failed to submit request'}`);
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      if (error.message.includes('Failed to fetch')) {
        setMessage(
          'Error: Could not connect to the server. Please ensure the backend is running on http://localhost:5000.'
        );
      } else {
        setMessage(`Error submitting request: ${error.message}`);
      }
    }
  };

  const handleAdminClick = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="recycle-form-container">
      <button
        onClick={handleAdminClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          backgroundColor: '#3476f1',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        Admin
      </button>

      <h2>Waste Recycle</h2>
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
              maxLength={10} // Restrict input to 10 characters
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
          <button type="submit">Submit</button>
        </div>
      </form>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
};

export default RecycleForm;