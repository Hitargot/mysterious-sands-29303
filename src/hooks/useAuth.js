import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const useAuth = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get('adminToken');

    if (token) {
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => setError(error));
    } else {
      setError('No token found, user is not authenticated');
    }
  }, [url]);

  return { data, error };
};

export default useAuth;
