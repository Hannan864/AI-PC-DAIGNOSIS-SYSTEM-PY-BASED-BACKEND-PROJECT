import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '../../types';
import { db } from '../../services/db';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  login: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = async () => {
    // Safety timeout to prevent IndexedDB deadlocks from hanging the UI indefinitely
    const timeout = setTimeout(() => {
      console.warn('Auth: Session loading stalled. Bypassing lock for recovery.');
      setIsLoading(false);
    }, 5000);

    try {
      await db.init();
      const sessionId = await db.getSetting('current_session');
      if (sessionId) {
        const activeSession = await db.getSession(sessionId);
        if (activeSession && activeSession.expiresAt > Date.now()) {
          setSession(activeSession);
          const activeUser = await db.getUserById(activeSession.userId);
          setUser(activeUser);
          console.log('Auth: Session active for', activeUser?.email);
          return;
        } else if (activeSession) {
          await db.deleteSession(sessionId);
          await db.setSetting('current_session', null);
        }
      }
    } catch (e) {
      console.error('Auth: Session load error:', e);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const activeSession = await db.getSession(sessionId);
      if (activeSession) {
        setSession(activeSession);
        const activeUser = await db.getUserById(activeSession.userId);
        setUser(activeUser);
      }
    } catch (err) {
      console.error('Login session fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (session) {
      try {
        await db.deleteSession(session.id);
        await db.setSetting('current_session', null);
        setSession(null);
        setUser(null);
        await db.setSetting('open_tabs', null);
        await db.setSetting('active_tab', null);
      } catch (err) {
        console.error('Logout cleanup failed:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
