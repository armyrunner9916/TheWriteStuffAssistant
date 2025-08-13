import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Set the initial title
document.title = "The Write Stuff";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);