import React, { useState, useEffect } from "react";
import axios from "axios";
import { WindmillSpinner } from "react-spinner-overlay";  // Import the spinner
import "../styles/ServiceManagement.css";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    exchangeRates: {
      usd: "",
      eur: "",
      gbp: "",
    },
    description: "",
    note: "",
    status: "valid",
  });
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [loading, setLoading] = useState(false);  // Add a loading state

  useEffect(() => {
    fetchServices();
  }, []);

  // Automatically set USD exchange rate when the name is "Website Recharge"
  useEffect(() => {
    if (formData.name === "Website Recharge") {
      console.log("Setting USD to:", 11000);
      setFormData((prevData) => ({
        ...prevData,
        exchangeRates: {
          ...prevData.exchangeRates,
          usd: 11000,
        },
      }));
    }
  }, [formData.name]);

  const fetchServices = async () => {
    setLoading(true);  // Start loading before the API call
    try {
      const response = await axios.get("https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);  // End loading after the API call
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("exchangeRates")) {
      const currency = name.split(".")[1];
      setFormData({
        ...formData,
        exchangeRates: { ...formData.exchangeRates, [currency]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.note) {
      alert("Please fill in all required fields.");
      return;
    }

    const serviceData = { ...formData };

    try {
      if (editingService) {
        await axios.put(
          `https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/services/${editingService._id}`,
          serviceData
        );
      } else {
        await axios.post("https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/services/create", serviceData);
      }

      fetchServices();
      setFormData({
        name: "",
        exchangeRates: { usd: "", eur: "", gbp: "" },
        description: "",
        note: "",
        status: "valid",
      });
      setEditingService(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({ ...service, exchangeRates: service.exchangeRates });
    setShowForm(true);
  };

  const handleToggleStatus = async (service) => {
    const updatedService = {
      ...service,
      status: service.status === "valid" ? "invalid" : "valid",
    };

    try {
      await axios.put(`https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/services/${service._id}`, updatedService);
      fetchServices();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://mysterious-sands-29303-c1f04c424030.herokuapp.com/api/services/${serviceToDelete._id}`);
      fetchServices();
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const openModal = (service) => {
    setServiceToDelete(service);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setServiceToDelete(null);
  };

  return (
    <div className="service-management">
      <h2>Service Management</h2>

      <button onClick={() => setShowForm(true)} className="create-service-btn">
        Create Service
      </button>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="service-form">
            <input
              type="text"
              name="name"
              placeholder="Service Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="exchangeRates.usd"
              placeholder="Exchange Rate (USD)"
              value={formData.exchangeRates.usd}
              onChange={handleInputChange}
              required
              disabled={formData.name === "Website Recharge"} // Disable input if auto-filled
            />
            <input
              type="number"
              name="exchangeRates.eur"
              placeholder="Exchange Rate (EUR)"
              value={formData.exchangeRates.eur}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="exchangeRates.gbp"
              placeholder="Exchange Rate (GBP)"
              value={formData.exchangeRates.gbp}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
            <textarea
              name="note"
              placeholder="Note"
              value={formData.note}
              onChange={handleInputChange}
            ></textarea>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
            </select>
            <button type="submit">
              {editingService ? "Update Service" : "Add Service"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}>
              Close
            </button>
          </form>
        </div>
      )}

      <div className="service-list">
        <WindmillSpinner
          loading={loading}  // Show spinner when loading is true
          text="Loading services..."
        />
        {!loading && services.map((service) => (
          <div key={service._id} className="service-card">
            <h3>{service.name}</h3>
            <div className="exchange-rates">
              <p>USD: {service.exchangeRates.usd}</p>
              <p>EUR: {service.exchangeRates.eur}</p>
              <p>GBP: {service.exchangeRates.gbp}</p>
            </div>
            <div className="description">{service.description}</div>
            {service.note && <div className="note">{service.note}</div>}
            <div className="service-actions">
              <button onClick={() => handleEdit(service)}>Edit</button>
              <button
                onClick={() => handleToggleStatus(service)}
                className={service.status === "valid" ? "" : "inactive"}
              >
                {service.status === "valid" ? "Disable" : "Enable"}
              </button>
              <button onClick={() => openModal(service)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this service?</h3>
            <button onClick={handleDelete}>Yes</button>
            <button onClick={closeModal}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
