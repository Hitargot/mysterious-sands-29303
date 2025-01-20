import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
import Alert from '../components/Alert'; // Your Alert component
import { CircleSpinnerOverlay } from 'react-spinner-overlay'; // Spinner for loading
import "../styles/ManageContacts.css";

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminName, setAdminName] = useState("");
  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";


  // Utility to decode admin token
  const getAdminUsername = () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.username || "Admin";
      } catch (err) {
        console.error("Error decoding token:", err);
        return "Admin";
      }
    }
    return "Admin";
  };

  useEffect(() => {
    // Set admin name on mount
    const username = getAdminUsername();
    setAdminName(username);
  }, []);

  useEffect(() => {
    // Fetch contacts from API
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/contacts`);
        setContacts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        setError("Failed to fetch contacts. Please try again.");
        setLoading(false);
      }
    };

    fetchContacts();
  }, [apiUrl]);

  const handleReplyChange = (e) => setReply(e.target.value);

  const handleReplySubmit = async (contactId) => {
    try {
      const response = await axios.post(`${apiUrl}/api/reply`, {
        contactId,
        replyMessage: reply,
        repliedBy: adminName || "Admin",
      });

      if (response.status === 200) {
        setAlert({ type: "success", message: "Reply sent successfully!" });
        setReply("");
        setSelectedContact(null);

        // Refetch the contacts after sending the reply
        const updatedContacts = await axios.get(`${apiUrl}/api/contacts`);
        setContacts(updatedContacts.data);
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      setAlert({ type: "error", message: "Failed to send reply!" });
    }
  };

  const handleCancelReply = () => {
    setReply("");
    setSelectedContact(null);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <CircleSpinnerOverlay
        size={50}
        color="#4fa94d"
        loading={loading}
        overlayColor="rgba(0, 0, 0, 0.5)"
      />
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="contacts-container">
      <h2>Contacts</h2>
      <input
        type="text"
        className="search-bar"
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {alert && <Alert type={alert.type} message={alert.message} />}
      {filteredContacts.length > 0 ? (
        <ul>
          {filteredContacts.reverse().map((contact) => (
            <li key={contact._id} className="contact-item">
              <p>
                <strong>Name:</strong> {contact.name}
              </p>
              <p>
                <strong>Email:</strong> {contact.email}
              </p>
              <div className="chat-box">
                <div className="user-message">
                  <p>
                    <strong>Message:</strong> {contact.message}
                  </p>
                  <p>
                    <small>
                      {dayjs(contact.createdAt).format("MMM D, YYYY [at] h:mm A")}
                    </small>
                  </p>
                </div>
                {contact.replies &&
                  contact.replies.slice().reverse().map((reply, index) => (
                    <div className="admin-reply" key={index}>
                      <p>
                        <strong>Admin:</strong> {reply.replyMessage}
                      </p>
                      <p>
                        <small>
                          {dayjs(reply.repliedAt).format("MMM D, YYYY [at] h:mm A")}
                        </small>
                      </p>
                      <p>
                        <small>Replied by: {reply.repliedBy || "Admin"}</small>
                      </p>
                    </div>
                  ))}
              </div>
              <button onClick={() => setSelectedContact(contact._id)}>Reply</button>
              {selectedContact === contact._id && (
                <div className="reply-form">
                  <textarea
                    value={reply}
                    onChange={handleReplyChange}
                    placeholder="Type your reply..."
                  />
                  <button onClick={() => handleReplySubmit(contact._id)}>
                    Send Reply
                  </button>
                  <button
                    onClick={handleCancelReply}
                    className="cancel-reply-btn"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No contacts found.</p>
      )}
    </div>
  );
};

export default ManageContacts;
