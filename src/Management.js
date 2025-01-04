import React, { useState, useEffect } from "react";
import { GiWashingMachine } from "react-icons/gi";
import "./Management.css";
import axios from "axios";

const Management = () => {
  const [mealCount, setMealCount] = useState(0);
  const [machines, setMachines] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      axios
        .get("http://localhost:5000/washing-machines", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setMachines(response.data);
        })
        .catch((error) => {
          console.error("Error fetching washing machines:", error);
        });

      axios
        .get("http://localhost:5000/all-reservations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setAllReservations(response.data);
        })
        .catch((error) => {
          console.error("Error fetching all reservations:", error);
        });
    } else {
      console.log("Token missing");
    }
  }, []);

  const handleStatusChange = async (machineId, status) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optimistic update: update the state immediately
      const updatedMachines = machines.map((machine) =>
        machine.id === machineId ? { ...machine, status } : machine
      );
      setMachines(updatedMachines);
      try {
        console.log("Sending request payload:", { machineId, status });
        const response = await axios.post(
          "http://localhost:5000/update-washing-machine-status",
          { machineId, status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Response from server:", response.data); // Log the server response
        setMessage("Washing machine status updated successfully!");
        setError("");
        // Refetch the updated list of washing machines
        axios
          .get("http://localhost:5000/washing-machines", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            setMachines(response.data);
          })
          .catch((error) => {
            console.error("Error fetching washing machines:", error);
          });

        // Refetch the updated list of all reservations
        axios
          .get("http://localhost:5000/all-reservations", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            setAllReservations(response.data);
          })
          .catch((error) => {
            console.error("Error fetching all reservations:", error);
          });
      } catch (err) {
        console.error("Error updating washing machine status:", err);
        setError("Failed to update washing machine status");
        setMessage("");
        // Revert the state change on error
        setMachines(machines);
      }
    } else {
      console.log("Token missing");
    }
  };

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
      <div className="washing-machine-management">
        <h2>Washing Machine Management</h2>
        <div className="machines">
          {machines.map((machine) => (
            <div key={machine.id} className="machine">
              <GiWashingMachine size="100px" />
              <div className="management-controls">
                <button
                  onClick={() => handleStatusChange(machine.id, "pending")}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange(machine.id, "washing")}
                >
                  Washing
                </button>
                <button
                  onClick={() => handleStatusChange(machine.id, "finished")}
                >
                  Finished
                </button>
              </div>
            </div>
          ))}
        </div>
        <h3>All Washing Machine Reservations</h3>
        <div className="all-reservations-list">
          {allReservations.map((reservation) => (
            <div key={reservation.id} className="reservation-item">
              <p>
                <strong>Machine Number:</strong> {reservation.machine_number}
              </p>
              <p>
                <strong>Status:</strong> {reservation.status}
              </p>
              <p>
                <strong>User:</strong> {reservation.email}
              </p>
            </div>
          ))}
        </div>
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Management;
