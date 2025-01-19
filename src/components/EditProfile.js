// src/components/EditProfile.js

import React from 'react';

const EditProfile = () => {
  return (
    <div>
      <h3>Edit Profile</h3>
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditProfile;
