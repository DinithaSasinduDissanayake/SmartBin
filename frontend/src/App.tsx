import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PickupForm from './components/PickupForm';
import MyBinDetails from './components/MyBinDetails';
import PickupDetails from './components/PickupDetails';
import PickupRequests from './components/PickupRequests';
import PickupRequestDetails from './components/PickupRequestDetails';
import './App.css';


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PickupForm />} />
                <Route path="/my-bin-details" element={<MyBinDetails />} />
                <Route path="/pickup-details/:id" element={<PickupDetails />} />
                <Route path="/pickup-requests" element={<PickupRequests />} />
                <Route path="/pickup-request-details/:id" element={<PickupRequestDetails />} />
            </Routes>
        </Router>
    );
};

export default App;