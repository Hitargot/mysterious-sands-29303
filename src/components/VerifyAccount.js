import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VerifyAccount.css'; // Import the CSS file

const VerifyAccount = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const verifyAccount = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      try {
        const response = await fetch(`${apiUrl}/api/admin/verify?token=${token}`);
        const result = await response.text();
        setMessage(result);

        if (response.ok) {
          setMessageType('success');
          setTimeout(() => navigate('/admin/login'), 3000); // Redirect after 3 seconds
        } else {
          setMessageType('error');
        }
      } catch (error) {
        setMessage('Verification failed. Please try again.');
        setMessageType('error');
      }
    };

    verifyAccount();
  }, [location, navigate, apiUrl]);

  return (
    <div className={`verify-account-container ${messageType}`}>
      <p>{message}</p>
    </div>
  );
};

export default VerifyAccount;
