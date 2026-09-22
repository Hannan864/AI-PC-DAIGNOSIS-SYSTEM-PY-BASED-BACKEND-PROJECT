import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const ReloadPrompt: React.FC = () => {
  let swResult: any = null;
  
  try {
    // Note: useRegisterSW is a hook and must be called at top level
    swResult = useRegisterSW({
      onRegistered(r) {
        console.log('PWA: Service Worker Registered');
      },
      onRegisterError(error) {
        console.error('PWA: Service Worker registration error', error);
      },
    });
  } catch (err) {
    console.warn('PWA: virtual:pwa-register failed to load.', err);
  }

  // Defensive guard: if the virtual module hook fails or returns nothing
  if (!swResult || !swResult.offlineReady) {
    return null;
  }

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needUpdate: [needUpdate, setNeedUpdate],
    updateServiceWorker,
  } = swResult;

  const close = () => {
    setOfflineReady(false);
    setNeedUpdate(false);
  };

  if (!offlineReady && !needUpdate) return null;

  return (
    <div className="fixed bottom-0 right-0 p-6 z-[9999]">
      <div className="glass p-4 rounded-xl border border-white/10 shadow-2xl bg-[#0b0f19] max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-3">
          {offlineReady ? (
            <span className="text-sm text-slate-200">App ready to work offline</span>
          ) : (
            <span className="text-sm text-slate-200">New content available, click on reload button to update.</span>
          )}
        </div>
        <div className="flex gap-2">
          {needUpdate && (
            <button 
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Reload
            </button>
          )}
          <button 
            onClick={close}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReloadPrompt;
