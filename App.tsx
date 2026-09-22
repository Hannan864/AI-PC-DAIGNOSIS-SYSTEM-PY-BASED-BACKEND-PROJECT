
import React, { useEffect } from 'react';
import { AuthProvider } from './components/Layout/AuthProvider';
import RoleRouter from './components/Layout/RoleRouter';

const App: React.FC = () => {
  useEffect(() => {
    const status = document.getElementById('ignition-status');
    if (status) {
      status.innerText = 'IGNITION: APP FULLY MOUNTED';
      status.style.borderColor = '#6366f1';
      status.style.color = '#6366f1';
    }
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30">
        {/* High-visibility render confirmation bar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: '#fde047',
          zIndex: 1000000,
          boxShadow: '0 0 10px #fde047'
        }} />
        <RoleRouter />
      </div>
    </AuthProvider>
  );
};

export default App;
