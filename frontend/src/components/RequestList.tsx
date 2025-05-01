// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/RequestList.css';

// const RequestList: React.FC = () => {
//   const [requests, setRequests] = useState<any[]>([]);
//   const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input
//   const navigate = useNavigate();

//   const fetchRequests = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/recycling-requests');
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log('Fetched requests:', data);
//       setRequests(data);
//       setFilteredRequests(data); // Initialize filtered requests
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching requests:', err);
//       setError('Failed to load requests. Please try again.');
//     }
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   // Handle search input change
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     // Filter requests based on name, email, or order ID
//     const filtered = requests.filter((req, index) => {
//       const orderId = String(index + 1).padStart(3, '0');
//       return (
//         req.name.toLowerCase().includes(query) ||
//         req.email.toLowerCase().includes(query) ||
//         orderId.includes(query)
//       );
//     });
//     setFilteredRequests(filtered);
//   };

//   // Clear search input
//   const handleClearSearch = () => {
//     setSearchQuery('');
//     setFilteredRequests(requests);
//   };

//   const handleDelete = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this request?')) {
//       return;
//     }

//     console.log('Deleting request with ID:', id);

//     try {
//       const response = await fetch(`http://localhost:5000/api/recycling-request/${id}`, {
//         method: 'DELETE',
//       });

//       console.log('Response status:', response.status);

//       if (response.ok) {
//         fetchRequests(); // Refresh the list after deletion
//         alert('Request deleted successfully');
//       } else {
//         const errorData = await response.json();
//         console.error('Error response:', errorData);
//         alert(`Error deleting request: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error('Fetch error:', error);
//       alert('Error deleting request');
//     }
//   };

//   const handleViewMore = (id: string) => {
//     console.log('Navigating to order details with ID:', id);
//     navigate(`/order-details/${id}`);
//   };

//   if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

//   return (
//     <div>
//       {/* Search Bar */}
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search by order ID, name, or email..."
//           value={searchQuery}
//           onChange={handleSearch}
//           className="search-input"
//         />
//         {searchQuery && (
//           <button
//             onClick={handleClearSearch}
//             className="clear-btn"
//           >
//             Clear
//           </button>
//         )}
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th>Order ID</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Contact No</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredRequests.length === 0 ? (
//             <tr>
//               <td colSpan={5}>No requests found.</td>
//             </tr>
//           ) : (
//             filteredRequests.map((req, index) => (
//               <tr key={req._id}>
//                 <td>{String(index + 1).padStart(3, '0')}</td>
//                 <td>{req.name}</td>
//                 <td>{req.email}</td>
//                 <td>{req.contact}</td>
//                 <td>
//                   <button className="view-more-btn" onClick={() => handleViewMore(req._id)}>
//                     ViewMore
//                   </button>
//                   <button className="delete-btn" onClick={() => handleDelete(req._id)}>
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default RequestList;



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RequestList.css';

const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search input
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recycling-requests');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched requests:', data);
      setRequests(data);
      setFilteredRequests(data); // Initialize filtered requests
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim(); // Remove whitespace
    setSearchQuery(query);
    console.log('Search query:', query);

    const filtered = requests.filter((req, index) => {
      const orderId = String(index + 1).padStart(3, '0');
      const isNameMatch = req.name.toLowerCase().includes(query.toLowerCase());
      const isEmailMatch = req.email.toLowerCase().includes(query.toLowerCase());
      const isOrderIdMatch = orderId === query; // Exact match for Order ID
      console.log(`Request ${orderId}: Name=${req.name}, Email=${req.email}, OrderIdMatch=${isOrderIdMatch}, NameMatch=${isNameMatch}, EmailMatch=${isEmailMatch}`);
      return isNameMatch || isEmailMatch || isOrderIdMatch;
    });

    console.log('Filtered requests:', filtered);
    setFilteredRequests(filtered);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredRequests(requests);
    console.log('Search cleared, reset to:', requests);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    console.log('Deleting request with ID:', id);

    try {
      const response = await fetch(`http://localhost:5000/api/recycling-request/${id}`, {
        method: 'DELETE',
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        fetchRequests(); // Refresh the list after deletion
        alert('Request deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Error deleting request: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error deleting request');
    }
  };

  const handleViewMore = (id: string) => {
    console.log('Navigating to order details with ID:', id);
    navigate(`/order-details/${id}`);
  };

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by order ID, name, or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="clear-btn"
          >
            Clear
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact No</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={5}>No requests found.</td>
            </tr>
          ) : (
            filteredRequests.map((req, index) => {
              const orderId = String(index + 1).padStart(3, '0');
              return (
                <tr key={req._id}>
                  <td>{orderId}</td>
                  <td>{req.name}</td>
                  <td>{req.email}</td>
                  <td>{req.contact}</td>
                  <td>
                    <button className="view-more-btn" onClick={() => handleViewMore(req._id)}>
                      ViewMore
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(req._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestList;