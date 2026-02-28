import React, { useEffect, useState } from 'react';

const AdminDataBundles = () => {
  const [bundles, setBundles] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/bundles');
        const j = await res.json();
        if (j.ok) setBundles(j.bundles || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Data Bundles (Admin)</h2>
      <p>Use this page to view and upsert data bundles. UI wiring is a stub N/A implement a proper form to edit bundles.</p>
      <ul>
        {bundles.map(b => (
          <li key={b._id}>{b.name} N/A {b.price} {b.currency} N/A {b.provider}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDataBundles;
