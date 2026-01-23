import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { LoginRequest, AuthState } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true,
  });

  // Check token validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await authApi.verifyToken();
        if (!isValid) {
          localStorage.removeItem('token');
          setState({ token: null, isAuthenticated: false, loading: false });
        } else {
          setState({ token, isAuthenticated: true, loading: false });
        }
      } else {
        setState({ token: null, isAuthenticated: false, loading: false });
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await authApi.login(credentials);
        localStorage.setItem('token', response.access_token);
        setState({
          token: response.access_token,
          isAuthenticated: true,
          loading: false,
        });
        toast.success('Login successful!');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Invalid username or password');
        throw error;
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ token: null, isAuthenticated: false, loading: false });
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
