import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import Alert from "./Alert"; // Import your custom alert component
import { v4 as uuidv4 } from 'uuid';


const ConfirmationForm = ({ selectedService }) => {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(selectedService || "");
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [alert, setAlert] = useState(null); // State for managing alerts
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
const [apiUrl] = useState("https://mysterious-sands-29303-c1f04c424030.herokuapp.com");
  //const [apiUrl] = useState("http://localhost:22222"); // Backend API URL
 

  useEffect(() => {
    if (selectedServiceId) {
      const generatedTransactionId = generateTransactionId();
      setTransactionId(generatedTransactionId);
    }
  }, [selectedServiceId]);

  const generateTransactionId = () => {
    const timestamp = new Date().getTime(); // Current timestamp
    const randomPart = uuidv4().split('-')[0]; // Short random part from UUID
    const emoji = "💸"; // Fun, visually appealing emoji
    const customString = "TRX"; // Custom prefix
  
    // Combine elements for a unique and fun transaction ID
    const uniqueId = `${customString}-${timestamp}-${randomPart}-${emoji}`;
  
    return uniqueId;
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/services`);
        setServices(response.data);
      } catch (error) {
        showAlert("Failed to fetch services.", "error");
      }
    };
    fetchServices();
  }, [apiUrl]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000); // Auto-dismiss alert after 5 seconds
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedServiceId || !file || !note || !transactionId) {
      showAlert("Please fill out all fields.", "error");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    const userId = getUserIdFromToken();

    if (!userId) {
      showAlert("User not authenticated.", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("serviceId", selectedServiceId);
    formData.append("file", file);
    formData.append("note", note);
    formData.append("userId", userId);
    formData.append("transactionId", transactionId);

    try {
      const response = await axios.post(`${apiUrl}/api/confirmations`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        showAlert("Confirmation submitted successfully!", "success");
        setSelectedServiceId("");
        setFile(null);
        setNote("");
        setTransactionId("");
      } else {
        showAlert("Error submitting confirmation.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while submitting the confirmation.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirmation-form">
      <h4>Submit Confirmation</h4>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Service</label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Upload Document</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div>
          <label>Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional notes..."
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Confirmation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmationForm;
