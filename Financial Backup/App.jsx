import React from "react";
import { Outlet } from "react-router-dom";  // Remove BrowserRouter
import Sidebar from "./components/sidebar.jsx";
import "./App.css";

const App = () => {
  return (
    <div className="container">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default App;