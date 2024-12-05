import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GiWashingMachine } from "react-icons/gi";
import { FaUtensils, FaTools } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

import "./Dashboard.css";

const Dashboard = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const userName = localStorage.getItem("name");
    setName(
      userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""
    );
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
