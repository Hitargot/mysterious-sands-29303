import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Alert from "./Alert";
import ConfirmationForm from "./ConfirmationForm";

const TradeDetails = ({ selectedService }) => {
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const validityCheckedRef = useRef(false);
  
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222";

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

  if (!serviceDetails) return null;

  return (
    <div style={{ 
      maxWidth: "500px", 
      margin: "20px auto", 
      padding: "20px", 
      background: "#f1e4d1", 
      borderRadius: "10px", 
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", 
      textAlign: "center" 
    }}>
      <h3 style={{ color: "#162660", fontSize: "22px", fontWeight: "bold" }}>Service Details</h3>

      {loading ? (
        <p style={{ fontSize: "16px", color: "#333" }}>Loading...</p>
      ) : (
        <>
          <p style={{ fontSize: "16px", color: "#333" }}>
            <strong>Description:</strong> {serviceDetails.description}
          </p>
          <p style={{ fontSize: "16px", color: "#333" }}>
            <strong>Note:</strong> {serviceDetails.note}
          </p>
          <p style={{ fontSize: "16px", color: "#333" }}>
            <strong>Tag:</strong> {serviceDetails.tag}
          </p>

          <button 
            onClick={checkValidity} 
            disabled={refreshing} 
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "15px",
              background: refreshing ? "#ccc" : "#162660",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: refreshing ? "not-allowed" : "pointer",
              transition: "background 0.3s ease-in-out"
            }}
          >
            {refreshing ? "Refreshing..." : "Check Validity"}
          </button>

          {!validityCheckedRef.current ? (
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Click "Check Validity" to see if the details are still valid.
            </p>
          ) : isValid ? (
            <p style={{ fontSize: "14px", color: "green", marginTop: "10px" }}>
              The details are still valid.
            </p>
          ) : (
            <p style={{ fontSize: "14px", color: "red", marginTop: "10px" }}>
              The details have expired.
            </p>
          )}

          {alertMessage && <Alert message={alertMessage} type={alertType} />}

          <div style={{
            marginTop: "20px", 
            padding: "15px", 
            background: "#d0e6fd", 
            borderRadius: "10px", 
            textAlign: "center"
          }}>
            <h4 style={{ fontSize: "18px", color: "#162660" }}>Submit Your Confirmation</h4>
            <ConfirmationForm selectedService={selectedService} />
          </div>
        </>
      )}
    </div>
  );
};

export default TradeDetails;
