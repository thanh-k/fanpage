import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const user = await authService.getCurrentUserFromServer();
        setCurrentUser(user);
      } catch (error) {
        authService.logout();
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (payload) => {
    const user = await authService.login(payload);
    setCurrentUser(user);
    return user;
  };

  const requestRegisterOtp = async (payload) => {
    return authService.requestRegisterOtp(payload);
  };

  const verifyRegisterOtp = async (payload) => {
    const user = await authService.verifyRegisterOtp(payload);
    setCurrentUser(user);
    return user;
  };

  const requestPasswordResetOtp = async (payload) => {
    return authService.requestPasswordResetOtp(payload);
  };

  const confirmPasswordReset = async (payload) => {
    return authService.confirmPasswordReset(payload);
  };

  const loginWithGoogleToken = async (token) => {
    const user = await authService.loginWithGoogleToken(token);
    setCurrentUser(user);
    return user;
  };

  const reloadCurrentUser = async () => {
    const user = await authService.getCurrentUserFromServer();
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      authLoading,
      login,
      requestRegisterOtp,
      verifyRegisterOtp,
      requestPasswordResetOtp,
      confirmPasswordReset,
      loginWithGoogleToken,
      logout,
      reloadCurrentUser
    }),
    [currentUser, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
