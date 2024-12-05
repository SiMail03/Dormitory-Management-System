import React from "react";
import { Link } from "react-router-dom";
import { GiWashingMachine } from "react-icons/gi";
import { FaUtensils, FaTools } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

import "./Sidebar.css";
import logo from "./logo_fondacija_izvor_nade.png";

const Sidebar = ({ isOpen }) => (
  <div className={isOpen ? "sidebar open" : "sidebar"}>
    {isOpen && (
      <div>
        <div className="sidebar-top">
          <Link to="/dashboard">
            <img id="sidebar-logo" src={logo} alt="Logo" />
          </Link>
        </div>
        <ul>
          <li>
            <Link to="/mealplan">
              <FaUtensils size="20px" /> Meals
            </Link>
          </li>
          <li>
            <Link to="/wash">
              <GiWashingMachine size="20px" /> Wash
            </Link>
          </li>
          <li>
            <Link to="/maintenance">
              <FaTools size="20px" /> Maintenance
            </Link>
          </li>
          <li>
            <Link to="/management">
              <MdManageAccounts size="20px" /> Management
            </Link>
          </li>
        </ul>
      </div>
    )}
  </div>
);

export default Sidebar;
