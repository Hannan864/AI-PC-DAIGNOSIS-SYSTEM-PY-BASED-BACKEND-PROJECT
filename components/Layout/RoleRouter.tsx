import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Role } from '../../types';
import { LoginScreen } from '../Services/auth/LoginScreen';
import { RegisterScreen } from '../Services/auth/RegisterScreen';
import { useTelemetryMode } from '../../services/diagnosticProvider';

// Non-lazy imports for recovery to eliminate Suspense/dynamic-import issues
import UserAppLayout from './UserAppLayout';
import TechnicianAppLayout from './TechnicianAppLayout';
import AdminAppLayout from './AdminAppLayout';

const LoadingFallback = () => (
  <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Finalizing Environment...</p>
  </div>
);

export const RoleRouter: React.FC = () => {
  const { session, isLoading, login } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const { isFallbackActive, clearFallback } = useTelemetryMode();

  useEffect(() => {
    const status = document.getElementById('ignition-status');
    if (status) status.innerText = `IGNITION: ROUTER ACTIVE (Loading=${isLoading})`;
  }, [isLoading]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!session) {
    return (
      <div className="h-screen w-full bg-[#020617] text-slate-100 flex items-center justify-center">
        <div className="w-full h-full max-w-4xl mx-auto flex items-center justify-center p-6">
           {showRegister ? (
              <RegisterScreen onRegisterSuccess={login} onGoToLogin={() => setShowRegister(false)} />
           ) : (
              <LoginScreen onLoginSuccess={login} onGoToRegister={() => setShowRegister(true)} />
           )}
         </div>
      </div>
    );
  }

  const renderLayout = () => {
    if (!session || !session.role) {
       return <div className="p-10 text-center text-rose-400">Error: Invalid Session Role. Please login again.</div>;
    }

    switch (session.role) {
      case Role.ADMIN: return <AdminAppLayout />;
      case Role.TECHNICIAN: return <TechnicianAppLayout />;
      case Role.USER: return <UserAppLayout />;
      default: return <div className="p-10 text-center text-rose-400">Error: Unauthorized Role Access.</div>;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#020617] overflow-hidden">
      {isFallbackActive && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs px-6 py-2.5 flex items-center justify-between gap-4 font-mono z-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold">⚠️ FAILSAFE STATUS:</span>
            <span>Python Diagnostic Service unavailable. Switched to Mock Diagnostics.</span>
          </div>
          <button 
            onClick={clearFallback} 
            className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded transition-all text-[10px] uppercase font-extrabold text-rose-200 active:scale-95 shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}
      <div className="flex-1 min-h-0 relative">
        {renderLayout()}
      </div>
    </div>
  );
};

export default RoleRouter;
