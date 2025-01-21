import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Alert from "./Alert";
import ConfirmationForm from "./ConfirmationForm"; // Importing the ConfirmationForm component

const TradeDetails = ({ selectedService }) => {
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const validityCheckedRef = useRef(false);
  const apiUrl = "http://localhost:22222";
  // const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";

  // Fetch service details when the component mounts or when selectedService changes
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/services/${selectedService}`);
        const data = response.data;

        if (data) {
          setServiceDetails(data);
        } else {
          setServiceDetails(null);
          setAlertMessage("Service not found.");
          setAlertType("error");
        }
      } catch (error) {
        setAlertMessage("Failed to fetch service details.");
        setAlertType("error");
      } finally {
        setLoading(false);
      }
    };

    if (selectedService) fetchServiceDetails();
  }, [selectedService, apiUrl]);

  // Function to check validity based on service status
  const checkValidity = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${apiUrl}/api/services/${selectedService}`);
      const data = response.data;

      if (data) {
        setServiceDetails(data);
        const valid = data.status === "valid";
        setIsValid(valid);

        if (!valid) {
          setAlertMessage(`${data.name} is currently not available.`);
          setAlertType("error");
        } else {
          setAlertMessage(`${data.name} is valid and available.`);
          setAlertType("success");
        }
      } else {
        setServiceDetails(null);
        setAlertMessage("Service not found.");
        setAlertType("error");
      }
    } catch (error) {
      setAlertMessage("Failed to refresh service details.");
      setAlertType("error");
    } finally {
      setRefreshing(false);
      validityCheckedRef.current = true;
    }
  };

  // Ensure the service exists, return null if it doesn't
  if (!serviceDetails) return null;

  const service = serviceDetails;

  return (
    <div className="trade-details">
      <h3>Service Details</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p><strong>Description:</strong> {service.description}</p>
          <p><strong>Note:</strong> {service.note}</p>

          {/* Add button to check validity and refresh status */}
          <button onClick={checkValidity} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Check Validity"}
          </button>

          {/* Show validity status */}
          {!validityCheckedRef.current ? (
            <p>Click "Check Validity" to see if the details are still valid.</p>
          ) : isValid ? (
            <p style={{ color: "green" }}>The details are still valid.</p>
          ) : (
            <p style={{ color: "red" }}>The details have expired.</p>
          )}

          {/* Show alert if there's any */}
          {alertMessage && <Alert message={alertMessage} type={alertType} />}

          {/* Mount the ConfirmationForm component */}
          <div className="confirmation-section">
            <h4>Submit Your Confirmation</h4>
            <ConfirmationForm selectedService={selectedService} />
          </div>
        </>
      )}
    </div>
  );
};

export default TradeDetails;
