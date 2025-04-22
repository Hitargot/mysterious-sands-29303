import React, { useState, useEffect } from 'react';

const NotificationModal = ({ onAllow, onDeny }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleAllow = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      onAllow(); // call your push setup here
    }
    setShow(false);
  };

  const handleDeny = () => {
    onDeny();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">Allow Push Notifications?</h2>
        <p className="mb-4">We’d like to send you updates about your transactions.</p>
        <div className="flex justify-center space-x-4">
          <button onClick={handleAllow} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Allow
          </button>
          <button onClick={handleDeny} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
