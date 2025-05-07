
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthSession {
  id: string;
  username: string;
  isAuthenticated: boolean;
  expiresAt: number;
}

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('adminSession');
      
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession) as AuthSession;
          
          // Check if session is expired
          if (parsedSession.expiresAt && Date.now() > parsedSession.expiresAt) {
            localStorage.removeItem('adminSession');
            setSession(null);
          } else {
            setSession(parsedSession);
          }
        } catch (error) {
          localStorage.removeItem('adminSession');
          setSession(null);
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, []);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    // This is a mock implementation
    // In a real app, you would verify credentials against your backend
    
    if (username === 'admin' && password === 'admin') {
      const newSession = {
        id: 'session-' + Math.random().toString(36).substring(2, 9),
        username: username,
        isAuthenticated: true,
        expiresAt: Date.now() + 3600000 // 1 hour from now
      };
      
      // Store session
      localStorage.setItem('adminSession', JSON.stringify(newSession));
      setSession(newSession);
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('adminSession');
    setSession(null);
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider value={{
      session,
      isAuthenticated: !!session?.isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
