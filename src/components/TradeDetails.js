import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Alert from "./Alert";
import ConfirmationForm from "./ConfirmationForm";
import { jwtDecode } from "jwt-decode"; // Correct the import to match the correct function name

const TradeDetails = ({ selectedService }) => {
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const validityCheckedRef = useRef(false);
  const [showCopy, setShowCopy] = useState(false);
  const [copiedTag, setCopiedTag] = useState("");
  const [generatedTag, setGeneratedTag] = useState(""); // Declare state for the generated tag
  // Add a state to track whether the tag has been generated or deleted
  const [hasGeneratedTag, setHasGeneratedTag] = useState(false); // Track if the tag has been generated
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCopied, setIsCopied] = useState(false); // Track if the tag has been copied



  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Get token from localStorage or sessionStorage
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

    if (storedToken) {
      const decodedToken = jwtDecode(storedToken);
      setUser(decodedToken);
      setToken(storedToken);
      console.log("Decoded User:", decodedToken);
    }
  }, []);



  // const apiUrl = "http://localhost:22222";
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";


  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/services/${selectedService}`);
        const data = response.data;

        if (data) {
          setServiceDetails(data);

          // Check if it's the special service
          if (data._id === "678abb516cbaa411698e7fa0") {
            setShowCopy(true);
          } else {
            setShowCopy(false); // optional fallback
          }
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

  useEffect(() => {
    const checkExistingTag = async () => {
      if (!user || !user.id || !serviceDetails || !serviceDetails._id) {
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/check-service-tag?userId=${user.id}&serviceId=${serviceDetails._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data && data.tag) {
          setGeneratedTag(data.tag);
          setHasGeneratedTag(true);
          console.log("Loaded tag from backend:", data.tag);
        } else {
          setHasGeneratedTag(false);
          console.log("No tag found in backend, show generate button");
        }
      } catch (error) {
        console.error("Failed to fetch tag:", error);
      }
    };

    checkExistingTag();
  }, [user, token, serviceDetails]);

  const generateTag = async () => {
    if (!user || !user.id) {
      setAlertMessage("User is not defined. Please log in.");
      setAlertType("error");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/get-service-tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          serviceId: serviceDetails._id,
        }),
      });

      const data = await res.json();

      if (data && data.tag) {
        setGeneratedTag(data.tag);
        setHasGeneratedTag(true);
        setAlertMessage(`Tag generated: ${data.tag}`);
        setAlertType("success");

        // Update serviceDetails state with the new tag
        setServiceDetails((prev) => ({
          ...prev,
          tags: [...(prev?.tags || []), { tag: data.tag, userId: user.id }],
        }));
      } else {
        setAlertMessage("Failed to generate tag.");
        setAlertType("error");
      }
    } catch (err) {
      console.error("Tag generation failed:", err);
      setAlertMessage("Failed to generate tag.");
      setAlertType("error");
    }
  };


  const truncateTag = (tag) => {
    // Truncate tag for mobile view (e.g., exdollarium + exd)
    if (isMobile && tag.length > 10) {
      return `${tag.slice(0, 10)}...`; // Truncate after 10 characters for mobile view
    }
    return tag; // Return full tag for desktop view
  };


  const copyTag = async () => {
    console.log("Copy Tag function triggered");

    // Check if the user is logged in and available
    if (!user || !user.id) {
      console.error("User is not defined");
      setAlertMessage("User is not defined. Please log in.");
      setAlertType("error"); // Show error alert if user is not defined
      return;
    }

    if (!generatedTag) {
      console.error("No generated tag available");
      setAlertMessage("No tag to copy.");
      setAlertType("error"); // Show error if no tag is generated
      return;
    }

    try {
      console.log("Copying tag:", generatedTag);
      await navigator.clipboard.writeText(generatedTag); // Copy the generated tag to clipboard
      setCopiedTag(generatedTag); // Update state with copied tag
      setIsCopied(true); // Set the button text to 'Copied'
      console.log("Tag copied successfully");

      // Show success alert for tag copied
      setAlertMessage(`Copied: ${generatedTag}`);
      setAlertType("success");
    } catch (err) {
      console.error("Copy failed:", err);
      setAlertMessage("Failed to copy tag.");
      setAlertType("error"); // Show error alert for failed copy
    }
  };



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

          {serviceDetails?._id === "678abb516cbaa411698e7fa0" && hasGeneratedTag === false && (
            <button
              onClick={generateTag}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Generate Tag
            </button>
          )}

          {serviceDetails?._id !== "678abb516cbaa411698e7fa0" && (
            <p style={{ fontSize: "16px", color: "#333" }}>
              <strong>Tag:</strong> {generatedTag ? generatedTag : serviceDetails?.tag}
            </p>
          )}

          {/* Check if serviceDetails and user exist before looping */}
          {serviceDetails?.tags?.length > 0 && user?.id && (
            <div style={{ marginTop: "15px" }}>
              <strong>Tag:</strong>
              {serviceDetails?.tags
                .filter((tagObj) => tagObj.userId.toString() === user.id)
                .map((tagObj, index) => (
                  <div key={index}>
                    <span>{truncateTag(tagObj.tag)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Show the Copy Tag button and copied tag message */}
          {serviceDetails?.tags?.length > 0 && showCopy && (
            <>
              <button
                onClick={copyTag} // Call the copyTag function instead of handleCopyTag
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  backgroundColor: "#ff8c00",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                {isCopied ? "Copied" : "Copy Tag"} {/* Change button text after copying */}
              </button>

              {copiedTag && (
                <p style={{ fontSize: "16px", color: "#333", marginTop: "10px" }}>
                  <strong>Copied Tag:</strong> {truncateTag(copiedTag)} {/* Display the copied tag */}
                </p>
              )}
            </>
          )}


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

          {alertMessage && (
            <Alert message={alertMessage} type={alertType} />
          )}

          <div style={{
            marginTop: "20px",
            padding: "15px",
            background: "#d0e6fd",
            borderRadius: "10px",
            textAlign: "center"
          }}>
            <h4 style={{ fontSize: "18px", color: "#162660" }}>Submit receipt for Confirmation</h4>
            <ConfirmationForm selectedService={selectedService} />
          </div>
        </>
      )}
    </div>
  );
};

export default TradeDetails;
