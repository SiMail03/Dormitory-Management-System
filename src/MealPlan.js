import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MealPlan.css";

const MealPlan = () => {
  const [mealSignup, setMealSignup] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/meal-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setMealSignup(response.data.mealSignedUp);
          setLoading(false); // Set loading to false after fetching data
        })
        .catch((error) => {
          console.error("Error fetching meal signup status:", error);
          setLoading(false); // Set loading to false on error
        });
    }
  }, []);

  const toggleSignup = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const url = mealSignup
        ? "http://localhost:5000/meal-cancel"
        : "http://localhost:5000/meal-signup";
      axios
        .post(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setMealSignup(!mealSignup);
        })
        .catch((error) => {
          console.error("Error signing up or canceling meal:", error);
        });
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Display loading indicator while fetching status
  }

  const week1Meals = {
    Monday: "Spaghetti Bolognese",
    Tuesday: "Chicken Curry",
    Wednesday: "Vegetarian Pizza",
    Thursday: "Grilled Salmon",
    Friday: "Tacos",
    Saturday: "Burger",
    Sunday: "Roast Chicken",
  };

  const week2Meals = {
    Monday: "Lasagna",
    Tuesday: "Fish and Chips",
    Wednesday: "Beef Stroganoff",
    Thursday: "Stuffed Peppers",
    Friday: "Pizza",
    Saturday: "Chicken Nuggets",
    Sunday: "Pasta Carbonara",
  };

  return (
    <div className="meal-plan-container">
      <h1>Today's Meal Signup</h1>
      <div className="toggle-container">
        <input
          type="checkbox"
          id="mealSignup"
          className="toggle-checkbox"
          checked={mealSignup}
          onChange={toggleSignup}
        />
        <label htmlFor="mealSignup" className="toggle-label">
          <div className="toggle-inner" />
        </label>
      </div>
      <div className="weekly-menus">
        <div className="weekly-menu">
          <h2>Week 1 Meal Plan</h2>
          <ul>
            {Object.keys(week1Meals).map((day) => (
              <li key={day}>
                <strong>{day}:</strong> {week1Meals[day]}
              </li>
            ))}
          </ul>
        </div>
        <div className="weekly-menu">
          <h2>Week 2 Meal Plan</h2>
          <ul>
            {Object.keys(week2Meals).map((day) => (
              <li key={day}>
                <strong>{day}:</strong> {week2Meals[day]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
