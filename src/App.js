import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import "./Header.css";
import "./Background.css"; // Import Background CSS

import Login from "./Login";
import "./Login.css";
import Register from "./Register";
import "./Register.css";
import Dashboard from "./Dashboard";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import "./Sidebar.css"; // Import Sidebar CSS
import MealPlan from "./MealPlan";
import "./MealPlan.css";

import Management from "./Management"; // Import Management Component

import axios from "axios";
import { FaBars } from "react-icons/fa";
import logo from "./logo_fondacija_izvor_nade.png";

const App = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) {
      axios
        .post("http://localhost:5000/login", { token })
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          navigate("/dashboard"); // Redirect to a protected route after login
        })
        .catch((error) => {
          console.error("Invalid or expired token");
        });
    }
  }, [location, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const shouldShowSidebar = !["/login", "/register"].includes(
    location.pathname
  );
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div
      className={`app-container ${
        isSidebarOpen && shouldShowSidebar ? "sidebar-open" : ""
      }`}
    >
      <header className="header">
        {shouldShowSidebar && (
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
        )}
        {isAuthPage ? (
          <img src={logo} alt="Logo" className="logo" />
        ) : (
          <Link to="/dashboard">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        )}
      </header>
      <div className="main-content">
        {shouldShowSidebar && <Sidebar isOpen={isSidebarOpen} />}
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mealplan" element={<MealPlan />} />
            <Route path="/management" element={<Management />} />

            {/* Add more routes here */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;
