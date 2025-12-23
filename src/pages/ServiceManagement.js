import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { WindmillSpinner } from "react-spinner-overlay"; // Import the spinner
import "../styles/ServiceManagement.css";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    exchangeRates: { usd: "", eur: "", gbp: "" },
    description: "",
    note: "",
    status: "valid",
    tag: "", // Add tag here
    fees: "", // Add fees explanation
    minAmount: "", // Minimum transaction amount
    maxAmount: "", // Maximum transaction amount
    isNew: false,
  });
  const [tags, setTags] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [loading, setLoading] = useState(false); // Add a loading state

  const apiUrl = process.env.REACT_APP_API_URL;


  // Memoize the fetchServices function
  const fetchServices = useCallback(async () => {
    setLoading(true); // Start loading before the API call
    try {
      const response = await axios.get(`${apiUrl}/api/services`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false); // End loading after the API call
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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

  const fetchTags = async (serviceId) => {
    try {
      const response = await fetch(`${apiUrl}/api/service/${serviceId}/tags`);
      const data = await response.json();

      console.log('Tags:', data.tags);

      setTags(data.tags);             // ✅ Set the fetched tags in state
      setSelectedServiceId(serviceId); // ✅ So you know which service you're managing
      setShowTagModal(true);           // ✅ Show the tag modal here after successful fetch
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };


  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setTagInput(tag.tag);
  };


  const handleUpdateTag = async () => {
    try {
      await axios.put(`${apiUrl}/api/update-service-tag/${selectedServiceId}/${editingTag._id}`, {
        tag: tagInput,
      });
      fetchTags(selectedServiceId);
      setEditingTag(null);
      setTagInput("");
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await axios.delete(`${apiUrl}/api/delete-tag/${selectedServiceId}/${tagId}`);
      fetchTags(selectedServiceId);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // support checkbox inputs
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: Boolean(checked) });
      return;
    }

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

    const serviceData = { ...formData }; // This already includes tag

    try {
      if (editingService) {
        await axios.put(`${apiUrl}/api/services/${editingService._id}`, serviceData);
      } else {
        await axios.post(`${apiUrl}/api/services/create`, serviceData);
      }

      fetchServices();
      setFormData({
        name: "",
        exchangeRates: { usd: "", eur: "", gbp: "" },
        description: "",
        note: "",
        status: "valid",
        tag: "", // Reset tag
      });
      setEditingService(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    // ensure isNew and exchangeRates are preserved when editing
    setFormData({ ...service, exchangeRates: service.exchangeRates, isNew: Boolean(service.isNew) });
    setShowForm(true);
  };

  const handleToggleStatus = async (service) => {
    const updatedService = {
      ...service,
      status: service.status === "valid" ? "invalid" : "valid",
    };

    try {
      await axios.put(`${apiUrl}/api/services/${service._id}`, updatedService);
      fetchServices();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/api/services/${serviceToDelete._id}`);
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
            <input
              type="text"
              name="tag"
              placeholder="Tag (e.g., Crypto, PayPal, Gift Card)"
              value={formData.tag}
              onChange={handleInputChange}
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

            {/* New Fields */}
            <textarea
              name="fees"
              placeholder="Fees Explanation (e.g., PayPal charges 3%...)"
              value={formData.fees}
              onChange={handleInputChange}
              required
            ></textarea>

            <input
              type="text"
              name="minAmount"
              placeholder="Minimum Amount (e.g., 5)"
              value={formData.minAmount}
              onChange={(e) => handleInputChange(e, 'minAmount')}
              required
              pattern="^[A-Za-z0-9-]+$"
              title="Please enter a valid number" // Show custom message for invalid input
            />

            <input
              type="text"
              name="maxAmount"
              placeholder="Maximum Amount (e.g., 1000)"
              value={formData.maxAmount}
              onChange={(e) => handleInputChange(e, 'maxAmount')}
              required
              pattern="^[A-Za-z0-9-]+$"
              title="Please enter a valid number" // Show custom message for invalid input
            />


            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
            </select>

            {/* New flag: mark service as NEW for UI highlights */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleInputChange}
              />
              <span>Mark as NEW (highlight in UI)</span>
            </label>

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
          loading={loading} // Show spinner when loading is true
          text="Loading services..."
        />
          {!loading &&
          services.map((service) => (
            <div key={service._id} className="service-card">
              <h3>
                {service.name}
                {service.isNew ? (
                  <span style={{ background: '#FF3B30', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12, marginLeft: 8 }}>NEW</span>
                ) : null}
              </h3>
              <div className="exchange-rates">
                <p>USD: {service.exchangeRates.usd}</p>
                <p>EUR: {service.exchangeRates.eur}</p>
                <p>GBP: {service.exchangeRates.gbp}</p>
              </div>
              <div className="description">{service.description}</div>
              <div className="description">{service.tag}</div>
              {service.note && <div className="note">{service.note}</div>}

              {/* ✅ Add this button inside the map */}
              {service._id === "678abb516cbaa411698e7fa0" && (
                <button
                  onClick={() => {
                    fetchTags(service._id);
                    setShowTagModal(true);
                  }}
                  className="tag-btn"
                >
                  Manage Tags
                </button>
              )}


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
          ))
        }
      </div>

      {showTagModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Manage Tags</h3>
            {tags.length === 0 ? (
              <p>No tags assigned yet.</p>
            ) : (
              tags.map((tag) => (
                <div key={tag._id} className="tag-item">
                  {editingTag && editingTag._id === tag._id ? (
                    <>
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                      />
                      <button onClick={handleUpdateTag}>Save</button>
                      <button onClick={() => setEditingTag(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{tag.tag}</span>
                      <button onClick={() => handleEditTag(tag)}>Edit</button>
                      <button onClick={() => handleDeleteTag(tag._id)}>Delete</button>
                    </>
                  )}
                </div>
              ))
            )}
            <button onClick={() => setShowTagModal(false)}>Close</button>
          </div>
        </div>
      )}


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
