
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './index.css';

// EMERGENCY STATUS INJECTION
const status = document.createElement('div');
status.id = 'ignition-status';
status.style.cssText = 'position:fixed; bottom:10px; left:10px; color:#4ade80; font-family:monospace; font-size:10px; z-index:99999; background:rgba(0,0,0,0.8); padding:4px; border-radius:4px; border:1px solid #4ade80;';
status.innerText = 'IGNITION: MODULE EVALUATED';
document.body.appendChild(status);

// GLOBAL CRASH HANDLER (Outside React)
window.onerror = (msg, url, line, col, error) => {
  status.innerText = 'IGNITION: FATAL RUNTIME ERROR';
  status.style.borderColor = '#ef4444';
  status.style.color = '#ef4444';
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed; inset:0; background:#450a0a; color:#fca5a5; padding:30px; z-index:1000000; font-family:monospace; overflow:auto;';
  errorDiv.innerHTML = `<h1>Critical Script Failure</h1><p>${msg}</p><pre>${error?.stack || ''}</pre><button onclick="location.reload()" style="background:white; color:black; padding:10px; border:none; cursor:pointer;">Reload</button>`;
  document.body.appendChild(errorDiv);
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  status.innerText = 'IGNITION: FATAL ERROR - NO ROOT';
  throw new Error("Could not find root element to mount to");
}

try {
  status.innerText = 'IGNITION: RENDERING...';
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  status.innerText = 'IGNITION: RENDER COMMAND ISSUED';
} catch (err) {
  status.innerText = 'IGNITION: MOUNT CRASH';
  console.error(err);
}
