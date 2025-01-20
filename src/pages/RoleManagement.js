import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateRole = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    roleName: '',
    permissions: [], // Array of selected permissions
    adminEmail: '', // The email to send the verification to
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminRoutes, setAdminRoutes] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch the available admin routes from the backend
useEffect(() => {
  const fetchAdminRoutes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/roles/admin/routes`);
      console.log('Fetched Routes:', response.data); // Check the response
      setAdminRoutes(response.data.routes);
    } catch (err) {
      console.error('Error fetching admin routes:', err);
      setError('Failed to fetch admin routes.');
    }
  };

  fetchAdminRoutes();
}, []);


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle permissions selection (checkboxes)
  const handlePermissionsChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const updatedPermissions = checked
        ? [...prevData.permissions, value] // Add permission
        : prevData.permissions.filter((permission) => permission !== value); // Remove permission
      return { ...prevData, permissions: updatedPermissions };
    });
  };
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${apiUrl}/api/roles/create-role`, formData);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create a New Role</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="roleName">Role Name</label>
          <input
            type="text"
            id="roleName"
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
            required
          />
        </div>

        

  <div>
  <label htmlFor="permissions">Permissions</label>
  <div>
    {adminRoutes.flatMap((route) =>
      route.permissions.map((permission, permIndex) => (
        <div key={permIndex}>
          <label>
            <input
              type="checkbox"
              name="permissions"
              value={permission}
              checked={formData.permissions.includes(permission)}
              onChange={handlePermissionsChange}
            />
            {permission}
          </label>
        </div>
      ))
    )}
  </div>
</div>


        <div>
          <label htmlFor="adminEmail">Admin Email (for verification)</label>
          <input
            type="email"
            id="adminEmail"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Role...' : 'Create Role'}
          </button>
        </div>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateRole;
