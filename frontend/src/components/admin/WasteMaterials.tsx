// import React, { useState, useEffect } from 'react';
// import '../../styles/WasteMaterials.css';

// const WasteMaterials: React.FC = () => {
//   const [materials, setMaterials] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [newQuantity, setNewQuantity] = useState<string>('');

//   // Fetch waste materials on component mount
//   useEffect(() => {
//     fetchWasteMaterials();
//   }, []);

//   const fetchWasteMaterials = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/waste-materials');
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       setMaterials(data);
//       setError(null);
//     } catch (err: any) {
//       console.error('Error fetching waste materials:', err);
//       setError('Failed to load waste materials. Please try again.');
//     }
//   };

//   const handleUpdateClick = (material: any) => {
//     setEditingId(material._id);
//     setNewQuantity(material.quantity.toString());
//   };

//   const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewQuantity(e.target.value);
//   };

//   const handleSave = async (id: string) => {
//     if (!/^\d+$/.test(newQuantity) || Number(newQuantity) < 0) {
//       alert('Quantity must be a non-negative number');
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:5000/api/waste-materials/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ quantity: Number(newQuantity) }),
//       });

//       if (response.ok) {
//         fetchWasteMaterials(); // Refresh the table
//         setEditingId(null);
//         setNewQuantity('');
//         alert('Quantity updated successfully');
//       } else {
//         const errorData = await response.json();
//         alert(`Error updating quantity: ${errorData.message}`);
//       }
//     } catch (error: any) {
//       console.error('Error updating quantity:', error);
//       alert('Error updating quantity');
//     }
//   };

//   const handleCancel = () => {
//     setEditingId(null);
//     setNewQuantity('');
//   };

//   if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

//   return (
//     <div className="waste-materials-container">
//       <h2>Waste Materials</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Waste Type</th>
//             <th>Quantity (kg)</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {materials.length === 0 ? (
//             <tr>
//               <td colSpan={3}>No waste materials found.</td>
//             </tr>
//           ) : (
//             materials.map((material) => (
//               <tr key={material._id}>
//                 <td>{material.wasteType}</td>
//                 <td>
//                   {editingId === material._id ? (
//                     <input
//                       type="text"
//                       value={newQuantity}
//                       onChange={handleQuantityChange}
//                       className="quantity-input"
//                     />
//                   ) : (
//                     material.quantity
//                   )}
//                 </td>
//                 <td>
//                   {editingId === material._id ? (
//                     <>
//                       <button className="save-btn" onClick={() => handleSave(material._id)}>
//                         Save
//                       </button>
//                       <button className="cancel-btn" onClick={handleCancel}>
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <button className="update-btn" onClick={() => handleUpdateClick(material)}>
//                       Update
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default WasteMaterials;