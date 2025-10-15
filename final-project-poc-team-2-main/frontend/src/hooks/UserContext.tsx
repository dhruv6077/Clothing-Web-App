import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Register } from '../data/UserAuth';
import { getUser } from '@/api/userApi';





// types/User.ts
export interface Team {
  id: string;
  name: string;
  // add other team properties if needed
}

export interface User {
  id: string;         // Though in the backend it is Long, you can represent it as string or number
  email: string;
  teams?: Team[];        // Optional if a user might not belong to a team
}


interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  checkAuthStatus: () => void;
  isLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    setIsLoading(true); // Always set loading true at the start
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        // Use a proper JWT library if possible; below is a simplified example
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        // Here adjust keys based on your token – for example:
        const user = await getUser(decodedToken.sub);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // Always stop loading no matter what
    }
  };


  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: errorText };
        }
        
        const dataRequest= await response.json();

        setIsAuthenticated(true);
        setUser(dataRequest.user);
        localStorage.setItem('jwtToken', dataRequest.token);
        // You can save the token/user info in context here if needed
        return { success: true };
    } catch (err) {
        return { success: false, error: 'Network error' };
    }
  };
 

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    try {
      const data = (await Register(email, password, name)) as { token: string; user: User };
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('jwtToken', data.token);
    } catch (error) {
      console.error("Signup error:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup, checkAuthStatus, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

