import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL;


  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAction = async (reviewId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${apiUrl}/api/admin/review/${reviewId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchReviews(); // Refresh the list after approval/rejection
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/api/admin/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchReviews(); // Refresh after deletion
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <div className="admin-review-container">
      <h2>Manage Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.userId?.username || review.username || "Unknown"}</td>
                <td>{review.reviewText}</td>
                <td>⭐ {review.rating} / 5</td>
                <td>{review.status}</td>
                <td>
                  {review.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(review._id, "approved")}>Approve</button>
                      <button onClick={() => handleAction(review._id, "rejected")}>Reject</button>
                    </>
                  )}
                  {review.status !== "pending" && (
                    <button onClick={() => handleDelete(review._id)}>🗑 Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReviewPage;
