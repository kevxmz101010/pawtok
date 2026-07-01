import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsuarioDTO, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: UsuarioDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UsuarioDTO | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioDTO | null>(() => {
    // Initialize from localStorage for instant render
    const saved = localStorage.getItem('pawtok_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('pawtok_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pawtok_user');
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // HACK: Para evitar el problema de caché de sesión del backend (que devuelve datos viejos),
        // solo actualizamos el estado si no teníamos datos previos, o si es un inicio de sesión nuevo.
        setUser((prev) => {
          if (prev && prev.id === data.id) {
             return prev; // Mantenemos la versión de localStorage que tiene las ediciones más recientes
          }
          return data;
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      // Keep localStorage user on network error so we don't flash logout
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMsg = 'Error al iniciar sesión';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = `Error del servidor (${response.status})`;
      }
      throw new Error(errorMsg);
    }

    const userData = await response.json();
    setUser(userData);
  };

  const register = async (data: RegisterRequest) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrarse');
    }
    // After successful registration, we need to login automatically
    await login({ email: data.email, contrasena: data.contrasena });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
