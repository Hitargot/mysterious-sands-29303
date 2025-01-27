// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure App is imported first
import './index.css'; // Import CSS after component imports
import store from '../src/redux/store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
