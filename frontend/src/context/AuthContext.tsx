import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { UsuarioDTO, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: UsuarioDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<UsuarioDTO>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UsuarioDTO | null>>;
}

/**
 * Limpia las respuestas guardadas del test de compatibilidad (match)
 */
export const clearSurveyStorage = () => {
  try {
    sessionStorage.removeItem('pawtok_survey');
    sessionStorage.removeItem('pawtok_survey_user_id');
    localStorage.removeItem('pawtok_survey');
    localStorage.removeItem('pawtok_survey_user_id');
  } catch (e) {}
};

/**
 * Contexto de Autenticación (AuthContext.tsx)
 * Este archivo es CRÍTICO para el Frontend. Es la memoria global de React que sabe si estás logueado o no.
 * En lugar de tener que pasarle el "usuario" de componente a componente, esto lo hace disponible en toda la app.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioDTO | null>(() => {
    // Initialize from localStorage for instant render
    const saved = localStorage.getItem('pawtok_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rol === 'ADMIN' && (!parsed.nombre || parsed.nombre.toLowerCase() === 'admin' || parsed.nombre.toLowerCase() === 'administrador')) {
        parsed.nombre = 'kj';
      }
      return parsed;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const prevUserKeyRef = useRef<string | null>(null);

  // Efecto Secundario: Cada vez que la variable `user` cambia (alguien hace login o logout),
  // esto actualiza el localStorage para que no pierdas la sesión si cierras la pestaña.
  useEffect(() => {
    if (user) {
      localStorage.setItem('pawtok_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pawtok_user');
    }

    // Aislamiento del match: Al cambiar de usuario o rol, se resetean las respuestas del test
    const currentKey = user ? `${user.id}_${user.rol}` : 'null';
    if (prevUserKeyRef.current !== null && prevUserKeyRef.current !== currentKey) {
      clearSurveyStorage();
    }
    prevUserKeyRef.current = currentKey;

    // Si el rol no es adoptante (USUARIO), nunca debe tener respuestas de compatibilidad activas
    if (user && user.rol !== 'USUARIO') {
      clearSurveyStorage();
    }
  }, [user]);

  /**
   * Verifica con el Backend si la Cookie de sesión sigue siendo válida.
   * Se ejecuta automáticamente cuando abres la página web.
   */
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.rol === 'ADMIN' && (!data.nombre || data.nombre.toLowerCase() === 'admin' || data.nombre.toLowerCase() === 'administrador')) {
          data.nombre = 'kj';
        }
        setUser(data);
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
    checkAuth(); // Llama a la verificación apenas carga la app
  }, []);

  /**
   * Envía tus credenciales al Backend para iniciar sesión.
   */
  const login = async (credentials: LoginRequest): Promise<UsuarioDTO> => {
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
    if (userData && userData.rol === 'ADMIN' && (!userData.nombre || userData.nombre.toLowerCase() === 'admin' || userData.nombre.toLowerCase() === 'administrador')) {
      userData.nombre = 'kj';
    }
    clearSurveyStorage();
    setUser(userData);
    return userData;
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
    // Si el registro fue exitoso, hace login automáticamente sin pedirte la contraseña de nuevo
    await login({ email: data.email, contrasena: data.contrasena });
  };

  /**
   * Cierra sesión destruyendo la cookie en el Backend y borrando tu usuario en React.
   */
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    clearSurveyStorage();
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
  // Un "Hook" personalizado para que cualquier otro archivo pueda usar: const { user, logout } = useAuth();
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
