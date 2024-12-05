import React, { useState, useEffect } from "react";
import "./Management.css";
import axios from "axios";

const Management = () => {
  const [mealCount, setMealCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/meal-count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setMealCount(response.data.count);
        })
        .catch((error) => {
          console.error("Error fetching meal count:", error);
        });
    } else {
      console.log("Token missing");
    }
  }, []);

  return (
    <div className="management-container">
      <h1>Meal Management</h1>
      <div className="meal-counter">
        <h2>Today's Meal Signup</h2>
        <p>{mealCount} users have signed up for today's meal</p>
      </div>
      <div className="meal-list">
        {/* Additional management features can go here */}
      </div>
    </div>
  );
};

export default Management;
