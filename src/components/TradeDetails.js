import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Importing Axios
import Alert from './Alert'; // Assuming you have an Alert component

const TradeDetails = ({ selectedService }) => {
  const [serviceDetails, setServiceDetails] = useState(null); // State for service details
  const [isValid, setIsValid] = useState(null); // State to store validity status
  const [alertMessage, setAlertMessage] = useState(""); // For storing alert message
  const [alertType, setAlertType] = useState(""); // For storing alert type (success/error)
  const [loading, setLoading] = useState(true); // To manage loading state
  const [refreshing, setRefreshing] = useState(false); // Track if status is being refreshed
  const validityCheckedRef = useRef(false); // Track if validity check has been done

  // Fetch service details when the component mounts or when selectedService changes
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:22222/api/services/${selectedService}`);
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

    fetchServiceDetails();
  }, [selectedService]);

  // Function to check validity based on service status
  const checkValidity = async () => {
    setRefreshing(true);
    try {
      // Re-fetch the service details to get the updated status
      const response = await axios.get(`http://localhost:22222/api/services/${selectedService}`);
      const data = response.data;

      if (data) {
        setServiceDetails(data);
        const valid = data.status === "valid"; // Check validity based on the updated data
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
      validityCheckedRef.current = true; // Mark validity as checked
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
        </>
      )}
    </div>
  );
};

export default TradeDetails;
