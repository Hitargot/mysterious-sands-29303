import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import '../styles/DashboardHeader.css';
import {jwtDecode} from 'jwt-decode'; // Ensure jwt-decode is correctly imported

const DashboardHeader = ({
  clearJwtToken,
  setBankAccounts,
  setSelectedBankAccount,
  setWalletBalance,
  handleAlert,
}) => {
  const navigate = useNavigate();
  let userName = 'User'; // Default username

  // Decode token to fetch username
  try {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (token) {
      const decodedToken = jwtDecode(token); // Decode the JWT token
      userName = decodedToken?.username || 'User'; // Extract username
    }
  } catch (error) {
    console.error('Error decoding token:', error); // Handle decoding error
    handleAlert('Session expired. Please log in again.', 'error');
    navigate('/login');
  }

  const handleLogout = () => {
    clearJwtToken();
    localStorage.removeItem('token'); // Remove token on logout
    if (typeof setBankAccounts === 'function') {
      setBankAccounts([]);
    }
    setSelectedBankAccount?.(null);
    setWalletBalance?.(0);
    navigate('/login');
    handleAlert('Logged out successfully.', 'success');
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="dashboard-header">
      <h1>{`${getGreeting()}, ${userName}`}</h1>
      <div className="header-icons">
        <Notifications />
        <FaUserCircle className="user-icon" aria-label="User Profile" onClick={navigateToProfile} />
        <button className="logout-button" onClick={handleLogout} aria-label="Logout">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
