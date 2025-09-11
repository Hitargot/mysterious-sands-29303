import React, { useState, useEffect, useCallback } from "react"; 
import axios from "axios";

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null); // Track which FAQ is being edited
  const [alert, setAlert] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;

  // ✅ Wrap fetchFAQs in useCallback to prevent re-creation on every render
  const fetchFAQs = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/faqs`);
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  }, [apiUrl]);

  // ✅ Include fetchFAQs in useEffect's dependency array
  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Handle Submit FAQ (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !answer) {
      setAlert("Both question and answer are required!");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${apiUrl}/api/faqs/${editingId}`, { question, answer });
        setAlert("FAQ updated successfully!");
      } else {
        await axios.post(`${apiUrl}/api/faqs/add`, { question, answer });
        setAlert("FAQ added successfully!");
      }

      setQuestion("");
      setAnswer("");
      setEditingId(null);
      fetchFAQs(); // Refresh FAQ list
    } catch (error) {
      setAlert("Failed to save FAQ.");
    }
  };

  // Handle Edit Click
  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  // Handle Delete FAQ
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/faqs/${id}`);
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin FAQ Management</h2>
      {alert && <p style={{ color: "green" }}>{alert}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          style={{ padding: "10px" }}
        />
        <textarea
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          style={{ padding: "10px", height: "80px" }}
        />
        <button type="submit" style={{ padding: "10px", background: editingId ? "orange" : "blue", color: "white" }}>
          {editingId ? "Update FAQ" : "Add FAQ"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setQuestion("");
              setAnswer("");
            }}
            style={{ padding: "10px", background: "gray", color: "white" }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h3>Existing FAQs</h3>
      <ul>
        {faqs.map((faq) => (
          <li key={faq._id} style={{ marginBottom: "10px" }}>
            <strong>{faq.question}</strong>
            <p>{faq.answer}</p>
            <button onClick={() => handleEdit(faq)} style={{ background: "orange", color: "white", marginRight: "5px" }}>
              Edit
            </button>
            <button onClick={() => handleDelete(faq._id)} style={{ background: "red", color: "white" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFAQ;
