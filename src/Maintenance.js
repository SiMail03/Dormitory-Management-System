import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Maintenance.css"; // Assuming you have a CSS file for styling

const Maintenance = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]); // State to store maintenance requests

  // Function to fetch maintenance requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in headers
        },
      };

      const response = await axios.get(
        "http://localhost:5000/maintenance-requests",
        config
      );
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRoomNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setRoomNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Retrieve the token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in headers
        },
      };

      await axios.post(
        "http://localhost:5000/maintenance-request",
        { roomNumber, description },
        config
      );
      setMessage("Maintenance request submitted successfully!");
      setError("");
      fetchRequests(); // Fetch updated requests after submission
    } catch (err) {
      setError("Failed to submit request");
      setMessage("");
    }
  };

  return (
    <div className="maintenance-container">
      <h2>Maintenance Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Number</label>
          <input
            type="text"
            value={roomNumber}
            onChange={handleRoomNumberChange}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Request</button>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>

      <h3>Your Maintenance Requests</h3>
      <div className="requests-list">
        {requests.map((request) => (
          <div key={request.id} className="request-item">
            <p>
              <strong>Room:</strong> {request.room_number}
            </p>
            <p>
              <strong>Description:</strong> {request.description}
            </p>
            <p>
              <strong>Status:</strong> {request.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Maintenance;
