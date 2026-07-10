import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '@/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const payload = await authService.getSession();

      if (payload?.user) {
        setUser(payload.user);
        setIsAuthenticated(true);
        await loadProfile(payload.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthError({
        type: 'session_error',
        message: error.message || 'Failed to check authentication',
      });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const loadProfile = async (userId) => {
    try {
      const profileData = await authService.getProfile(userId);
      setProfile(profileData);
      const roles = profileData?.user_roles?.map((ur) => ur.roles?.name).filter(Boolean)
        || await authService.getUserRoles(userId);
      setUserRoles(roles?.length ? roles : ['Member']);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
      setUserRoles(['Member']);
    }
  };

  const login = async (identifier, password) => {
    const isMobile = /^[\d+\s-]{10,}$/.test(String(identifier).trim());
    const result = isMobile
      ? await authService.signInWithMobile(identifier, password)
      : await authService.signInWithPassword(identifier, password);
    await checkSession();
    return result;
  };

  const register = async ({ email, password, fullName, mobile, firstName, lastName, profession, stateId, districtId, mandalName }) => {
    return authService.signUp({ email, password, fullName, mobile, firstName, lastName, profession, stateId, districtId, mandalName });
  };

  const loginWithGoogle = async () => authService.signInWithGoogle();

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setUserRoles([]);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email) => authService.resetPassword(email);

  const updatePassword = async (newPassword) => authService.updatePassword(newPassword);

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(user?.id, updates);
    setProfile(updated);
    return updated;
  };

  const isAdmin = userRoles.includes('Super Admin');

  /**
   * isLoadingPublicSettings — used by CmsrApp; always false here
   * since there is no separate public-settings loading phase.
   */
  const isLoadingPublicSettings = false;

  /**
   * navigateToLogin — used by CmsrApp when authError.type === 'auth_required'.
   * Redirects to /login preserving the current path as returnTo.
   */
  const navigateToLogin = useCallback(() => {
    const returnTo = typeof window !== 'undefined'
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : '';
    const target = returnTo ? `/login?returnTo=${returnTo}` : '/login';
    if (typeof window !== 'undefined') {
      window.location.href = target;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userRoles,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authChecked,
        authError,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        checkSession,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
