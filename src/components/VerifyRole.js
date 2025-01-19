import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VerifyAccount.css'; // Import the CSS file

const VerifyRole = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const verifyRole = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
    
      if (!token) {
        console.error('No token provided in query parameters.');
        setMessage('Verification token is required.');
        setMessageType('error');
        setLoading(false);
        return;
      }
    
      try {
        console.log('Sending verification request...');
        const response = await fetch(`${apiUrl}/api/roles/verify?token=${token}`);
    
        const contentType = response.headers.get('Content-Type');
        let result;
    
        if (contentType && contentType.includes('application/json')) {
          result = await response.json(); // Parse JSON if the response is JSON
        } else {
          result = { message: await response.text() }; // Treat plain text as the message
        }
    
        if (!response.ok) {
          console.error('Verification failed:', result.message);
          setMessage(result.message || 'Verification failed. Please try again.');
          setMessageType('error');
        } else {
          console.log('Verification succeeded:', result.message);
          setMessage(result.message || 'Account verified successfully!');
          setMessageType('success');
          setTimeout(() => navigate('/role/login'), 3000); // Redirect after 3 seconds
        }
      } catch (error) {
        console.error('Error during verification request:', error);
        setMessage('Verification failed. Please try again.');
        setMessageType('error');
      }
      setLoading(false);
    };
    

    verifyRole();
  }, [location, navigate]);

  return (
    <div className={`verify-account-container ${messageType}`}>
      {loading ? (
        <p>Verifying...</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
};

export default VerifyRole;
