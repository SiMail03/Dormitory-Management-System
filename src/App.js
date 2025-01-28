import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import { FaBars } from "react-icons/fa";

import "./css/App.css";
import "./css/Header.css";
import "./css/Background.css";
import "./css/Login.css";
import "./css/Register.css";
import "./css/Dashboard.css";
import "./css/Sidebar.css";
import "./css/MealPlan.css";
import "./css/Maintenance.css";
import "./css/Wash.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import MealPlan from "./components/MealPlan";
import Maintenance from "./components/Maintenance";
import Wash from "./components/Wash";
import Management from "./components/Management";
import withManagementAccess from "./components/withManagementAccess";

import logo from "./logo_fondacija_izvor_nade.png";

// Wrap Management component with access control HOC
const ManagementWithAccessControl = withManagementAccess(Management);

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
            <Route path="/" element={<Navigate to="/login" />} />{" "}
            {/* Redirect root to login */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mealplan" element={<MealPlan />} />
            <Route
              path="/management"
              element={<ManagementWithAccessControl />}
            />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/wash" element={<Wash />} />
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
