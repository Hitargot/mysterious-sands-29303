import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from 'jwt-decode';

const ConfirmationForm = ({ selectedService }) => {
  const [services, setServices] = useState([]); // State to store fetched services
  const [selectedServiceId, setSelectedServiceId] = useState(selectedService || ""); // State for selected service
  const [file, setFile] = useState(null); // State for uploaded file
  const [note, setNote] = useState(""); // State for note
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message
  const [alertType, setAlertType] = useState(""); // State for alert type (success/error)
  const [loading, setLoading] = useState(false); // State for loading spinner
//   const [apiUrl] = useState("http://localhost:22222"); // Backend API URL
  const [transactionId, setTransactionId] = useState(""); // Add this to your state
  const [apiUrl] = useState("https://mysterious-sands-29303-c1f04c424030.herokuapp.com"); // Backend API URL


// Set transactionId dynamically based on the service or other logic
useEffect(() => {
  if (selectedServiceId) {
    const generatedTransactionId = generateTransactionId(); // Function to generate or fetch the transaction ID
    setTransactionId(generatedTransactionId);
  }
}, [selectedServiceId]);

const generateTransactionId = () => {
  // Example logic to generate a transaction ID (could be based on time, user, or service)
  return "TX" + new Date().getTime(); // Example: Transaction ID based on current timestamp
};



  // Fetch services for dropdown
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/services`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setAlertMessage("Failed to fetch services.");
        setAlertType("error");
      }
    };
    fetchServices();
  }, [apiUrl]);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    console.log("Token retrieved:", token); // Log the retrieved token
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // Log the decoded token
        return decodedToken.id; // Use the 'id' from the decoded token
      } catch (error) {
        console.error("Error decoding token:", error); // Log any error in decoding
        return null;
      }
    }
    return null; // If no token is found, return null
  };
  
  
  const userId = getUserIdFromToken(); // Automatically fetch the userId from the token
  console.log("UserId from Token:", userId); // Log userId to ensure it's correct

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log("File Selected:", selectedFile); // Log the file selected by the user
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure all fields are filled
    if (!selectedServiceId || !file || !note || !transactionId) {
      setAlertMessage("Please fill out all fields.");
      setAlertType("error");
      return;
    }
  
    setLoading(true);
  
    // Retrieve userId from decoded token
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    let userId = null;
  
    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Use the 'id' from the decoded token
    }
  
    if (!userId) {
      setAlertMessage("User not authenticated.");
      setAlertType("error");
      setLoading(false);
      return;
    }
  
    // Prepare the data to be sent
    const formData = new FormData();
    formData.append("serviceId", selectedServiceId);
    formData.append("file", file);
    formData.append("note", note);
    formData.append("userId", userId);
    formData.append("transactionId", transactionId); // Ensure this is included if required
  
    try {
        const response = await axios.post(`${apiUrl}/api/confirmations`, formData, {
            headers: {
              "Authorization": `Bearer ${token}`,   // Correctly set the Authorization header
            },
          });
          
  
      if (response.data.success) {
        setAlertMessage("Confirmation submitted successfully!");
        setAlertType("success");
        // Reset form fields
        setSelectedServiceId("");
        setFile(null);
        setNote("");
        setTransactionId(""); // Clear the transactionId if necessary
      } else {
        setAlertMessage("Error submitting confirmation.");
        setAlertType("error");
      }
    } catch (error) {
      setAlertMessage("An error occurred while submitting the confirmation.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="confirmation-form">
      <h4>Submit Confirmation</h4>
      {alertMessage && (
        <div className={`alert ${alertType === "error" ? "error" : "success"}`}>
          {alertMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* Service Dropdown */}
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

        {/* File Upload */}
        <div>
          <label>Upload Document</label>
          <input type="file" onChange={handleFileChange} />
        </div>

        {/* Note Input */}
        <div>
          <label>Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Submit Button */}
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
