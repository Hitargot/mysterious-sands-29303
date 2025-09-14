import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Alert from "./Alert"; // Ensure this component is working correctly
import { v4 as uuidv4 } from "uuid";

const ConfirmationForm = ({ selectedService }) => {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(selectedService || "");
  const [files, setFiles] = useState([]);  // use array to hold multiple files
  const [note, setNote] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [showModal, setShowModal] = useState(false);


  // const [apiUrl] = useState("http://localhost:22222");
  // const [apiUrl] = useState("https://exdollarium-6f0f5aab6a7d.herokuapp.com");

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (selectedServiceId) {
      setTransactionId(generateTransactionId());
    }
  }, [selectedServiceId]);

  const generateTransactionId = () => {
    const timestamp = new Date().getTime();
    const randomPart = uuidv4().split("-")[0];
    return `TRX-${timestamp}-${randomPart} 💸`;
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
        return jwtDecode(token).id;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // convert FileList to an array
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedServiceId || !files || !note || !transactionId) {
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
formData.append("note", note);
formData.append("userId", userId);
formData.append("transactionId", transactionId);

files.forEach(file => {
  formData.append("files", file); // Append each file individually
});



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
        setFiles(null);
        setNote("");
        setTransactionId("");
        setShowModal(false);
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
    <div style={styles.container}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Button to Open Modal */}
      <button style={styles.openModalBtn} onClick={() => setShowModal(true)}>
        Open Confirmation Form
      </button>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Submit Confirmation</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Service</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Upload Document</label>
                <input type="file" onChange={handleFileChange} style={styles.fileInput} name="files" multiple />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any additional notes..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.submitButton} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Confirmation"}
                </button>
                <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    // padding: "20px",
  },
  openModalBtn: {
    backgroundColor: "#162660",
    color: "#fff",
    padding: "12px 10px 12px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "0.3s",
    touchAction: "manipulation",
    zIndex: 1000,
    pointerEvents: "auto",
    textAlign: "center",

  },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#d0e6fd",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    textAlign: "center",
  },
  modalTitle: {
    color: "#162660",
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  label: {
    fontWeight: "bold",
    color: "#162660",
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    border: "1px solid #162660",
    borderRadius: "5px",
    backgroundColor: "#f1e4d1",
  },
  fileInput: {
    padding: "10px",
    border: "1px solid #162660",
    borderRadius: "5px",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #162660",
    borderRadius: "5px",
    backgroundColor: "#f1e4d1",
    height: "80px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
  },
  submitButton: {
    backgroundColor: "#162660",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  closeButton: {
    backgroundColor: "#f1e4d1",
    color: "#162660",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ConfirmationForm;
