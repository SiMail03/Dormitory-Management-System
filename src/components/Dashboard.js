import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GiWashingMachine } from "react-icons/gi";
import { FaUtensils, FaTools } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

import "../css/Dashboard.css";

const Dashboard = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/user-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const email = response.data.email;
        const extractName = (email) => {
          const namePart = email.split("@")[0];
          const firstName = namePart.split(".")[0];
          return firstName.charAt(0).toUpperCase() + firstName.slice(1);
        };
        const userName = extractName(email);
        setName(userName);
      } catch (err) {
        console.error("Failed to fetch user information", err);
        setName(".");
      }
    };
    fetchUserInfo();
  }, []);
  return (
    <div className="dashboard-container">
      <h1>Welcome, {name}</h1>
      <div className="options">
        <div className="row">
          <Link to="/mealplan" className="option-card">
            <FaUtensils size="100px" />

            <h2>Meals</h2>
          </Link>
          <Link to="/wash" className="option-card">
            <GiWashingMachine size="100px" />

            <h2>Wash</h2>
          </Link>
        </div>
        <div className="row">
          <Link to="/maintenance" className="option-card">
            <FaTools size="100px" />
            <h2>Maintenance</h2>
          </Link>
          <Link to="/management" className="option-card">
            <MdManageAccounts size="100px" />
            <h2>Management</h2>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
