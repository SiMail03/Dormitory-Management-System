import React, { useState, useEffect } from "react";
import { GiWashingMachine } from "react-icons/gi";
import axios from "axios";
import "./Wash.css"; // Assuming you have a CSS file for styling

const WashingMachine = () => {
  const [machines, setMachines] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Function to fetch washing machines and reservations
  const fetchMachines = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in headers
        },
      };

      const machinesResponse = await axios.get(
        "http://localhost:5000/washing-machines",
        config
      );
      console.log(machinesResponse.data); // Log the response data
      setMachines(machinesResponse.data);

      const reservationsResponse = await axios.get(
        "http://localhost:5000/user-reservations",
        config
      );
      setUserReservations(reservationsResponse.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleReserve = async (machineId) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in headers
        },
      };

      await axios.post(
        "http://localhost:5000/reserve-washing-machine",
        { machineId },
        config
      );
      setMessage("Washing machine reserved successfully!");
      setError("");
      fetchMachines(); // Fetch updated machines and reservations after submission
    } catch (err) {
      setError("Failed to reserve washing machine");
      setMessage("");
    }
  };

  return (
    <div className="washing-machine-container">
      <h2>Washing Machine Reservation</h2>
      <div className="machines">
        {machines.map((machine) => (
          <div key={machine.id} className="machine">
            <GiWashingMachine size="100px" />
            <button
              onClick={() => handleReserve(machine.id)}
              disabled={machine.status !== "available"}
            >
              {machine.status === "available" ? "Reserve" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <h3>Your Washing Machine Reservations</h3>
      <div className="reservations-list">
        {userReservations.map((reservation) => (
          <div key={reservation.id} className="reservation-item">
            <p>
              <strong>Machine Number:</strong> {reservation.machine_number}
            </p>
            <p>
              <strong>Status:</strong> {reservation.status}
            </p>
          </div>
        ))}
      </div>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WashingMachine;
