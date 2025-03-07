import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const apiUrl = "https://mysterious-sands-29303-c1f04c424030.herokuapp.com";
  //const apiUrl = "http://localhost:22222"; 


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

      // Refresh the list after approval/rejection
      fetchReviews();
    } catch (error) {
      console.error("Error updating review status:", error);
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.userId?.username || "Unknown"}</td>
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
                  {review.status === "approved" && <span>✅ Approved</span>}
                  {review.status === "rejected" && <span>❌ Rejected</span>}
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
