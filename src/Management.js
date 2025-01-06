import React, { useState, useEffect } from "react";
import axios from "axios";
import { GiWashingMachine } from "react-icons/gi";
import "./Management.css";

const Management = () => {
  const [mealCount, setMealCount] = useState(0);
  const [machines, setMachines] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/meal-count", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setMealCount(response.data.count);
        })
        .catch((error) => {
          console.error("Error fetching meal count:", error);
        });

      axios
        .get("http://localhost:5000/washing-machines", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setMachines(response.data);
        })
        .catch((error) => {
          console.error("Error fetching washing machines:", error);
        });

      axios
        .get("http://localhost:5000/all-reservations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAllReservations(response.data);
        })
        .catch((error) => {
          console.error("Error fetching all reservations:", error);
        });

      axios
        .get("http://localhost:5000/maintenance-requests-management", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setMaintenanceRequests(response.data);
        })
        .catch((error) => {
          console.error("Error fetching maintenance requests:", error);
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
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Response from server:", response.data); // Log the server response
        setMessage("Washing machine status updated successfully!");
        setError("");
        // Refetch the updated list of washing machines
        axios
          .get("http://localhost:5000/washing-machines", {
            headers: { Authorization: `Bearer ${token}` },
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
            headers: { Authorization: `Bearer ${token}` },
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

  const handleMaintenanceRequestComplete = async (requestId) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        console.log("Marking maintenance request as completed:", { requestId });
        const response = await axios.post(
          "http://localhost:5000/complete-maintenance-request",
          { requestId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Response from server:", response.data); // Log the server response
        setMessage("Maintenance request marked as completed!");
        setError("");
        // Remove the completed request from the state
        setMaintenanceRequests(
          maintenanceRequests.filter((request) => request.id !== requestId)
        );
      } catch (err) {
        console.error("Error marking maintenance request as completed:", err);
        setError("Failed to mark maintenance request as completed");
        setMessage("");
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
      <div className="maintenance-management">
        <h2>Maintenance Requests</h2>
        <ul className="maintenance-list">
          {maintenanceRequests.map((request) => (
            <li key={request.id} className="maintenance-item">
              <p>
                <strong>ID:</strong> {request.id}
              </p>
              <p>
                <strong>Room number:</strong> {request.room_number}
              </p>
              <p>
                <strong>Issue:</strong> {request.description}
              </p>
              <p>
                <strong>Status:</strong> {request.status}
              </p>
              <button
                onClick={() => handleMaintenanceRequestComplete(request.id)}
              >
                Mark as Completed
              </button>
            </li>
          ))}
        </ul>
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Management;
