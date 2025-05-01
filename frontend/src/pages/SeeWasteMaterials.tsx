// import React, { useState, useEffect } from 'react';
// import '../styles/SeeWasteMaterials.css';

// const SeeWasteMaterials: React.FC = () => {
//   const [materials, setMaterials] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch waste materials on component mount
//   useEffect(() => {
//     const fetchWasteMaterials = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/waste-materials');
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setMaterials(data);
//         setError(null);
//       } catch (err: any) {
//         console.error('Error fetching waste materials:', err);
//         setError('Failed to load waste materials. Please try again.');
//       }
//     };

//     fetchWasteMaterials();
//   }, []);

//   if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

//   return (
//     <div className="see-waste-materials-container">
//       <h2>Waste Materials</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Waste Type</th>
//             <th>Quantity (kg)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {materials.length === 0 ? (
//             <tr>
//               <td colSpan={2}>No waste materials found.</td>
//             </tr>
//           ) : (
//             materials.map((material) => (
//               <tr key={material._id}>
//                 <td>{material.wasteType}</td>
//                 <td>{material.quantity}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SeeWasteMaterials;