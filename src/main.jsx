import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Enhanced error logging for debugging build/publish issues
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise,
    stack: event.reason?.stack,
    name: event.reason?.name,
    message: event.reason?.message,
    fullError: JSON.stringify(event.reason, Object.getOwnPropertyNames(event.reason))
  });

  // Post to parent window for external logging
  window.parent.postMessage({
    type: 'horizons-unhandled-rejection',
    error: {
      reason: event.reason?.toString(),
      stack: event.reason?.stack,
      name: event.reason?.name,
      message: event.reason?.message,
      fullError: JSON.stringify(event.reason, Object.getOwnPropertyNames(event.reason))
    }
  }, '*');
});

// Wrap ReactDOM.createRoot in try-catch
try {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    const error = new Error('Root element not found in DOM');
    console.error('Critical Error:', error);
    window.parent.postMessage({
      type: 'horizons-critical-error',
      error: error.message
    }, '*');
    throw error;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('App successfully mounted');
} catch (error) {
  console.error('Failed to mount React app:', {
    error,
    message: error.message,
    stack: error.stack,
    name: error.name,
    fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
  });

  window.parent.postMessage({
    type: 'horizons-mount-error',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }
  }, '*');

  throw error;
}