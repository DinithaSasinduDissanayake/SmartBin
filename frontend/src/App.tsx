import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ToolManagement from './components/ToolManagement';
import EquipmentManagement from './components/EquipmentManagement';
import ResourceManagement from './components/ResourceManagement';
import ResourcesDisplay from './components/ResourcesDisplay';
import ScheduleManagement from './components/ScheduleManagement';
import ScheduleDisplay from './components/ScheduleDisplay';
import CustomerScheduleDisplay from './components/CustomerScheduleDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/custom.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        {/* Navigation bar */}
        <nav>
          <Link to="/">Home</Link>
          <Link to="/schedules">Schedule Management</Link>
          <Link to="/trucks">Truck Management</Link>
          <Link to="/equipment">Equipment Management</Link>
          <Link to="/tools">Tool Management</Link>
          <Link to="/schedule-display">Schedule Display</Link>
          <Link to="/resources-display">Resources Display</Link>
          <Link to="/customer-schedules">Customer Schedules</Link>
        </nav>

        {/* Routes */}
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h1>Schedules</h1>
                  <div className="card-container">
                    <div className="card">
                      <h3>Home</h3>
                      <Link to="/">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Schedule Management</h3>
                      <Link to="/schedules">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Truck Management</h3>
                      <Link to="/trucks">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Equipment Management</h3>
                      <Link to="/equipment">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Tool Management</h3>
                      <Link to="/tools">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Schedule Display</h3>
                      <Link to="/schedule-display">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Resources Display</h3>
                      <Link to="/resources-display">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                    <div className="card">
                      <h3>Customer Schedules</h3>
                      <Link to="/customer-schedules">
                        <button className="card-button">View</button>
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/schedules" element={<ScheduleManagement />} />
            <Route path="/trucks" element={<ResourceManagement />} />
            <Route path="/equipment" element={<EquipmentManagement />} />
            <Route path="/tools" element={<ToolManagement />} />
            <Route path="/schedule-display" element={<ScheduleDisplay />} />
            <Route path="/resources-display" element={<ResourcesDisplay />} />
            <Route path="/customer-schedules" element={<CustomerScheduleDisplay />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
};

export default App;