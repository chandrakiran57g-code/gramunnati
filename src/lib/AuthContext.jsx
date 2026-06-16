import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { authService } from '@/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           // Supabase auth user
  const [profile, setProfile] = useState(null);      // Profile from profiles table
  const [userRoles, setUserRoles] = useState([]);    // Array of role names
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check initial session
    checkSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Fetch profile data
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setUserRoles([]);
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadProfile(session.user.id);
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

      // Extract role names
      const roles = profileData?.user_roles?.map(ur => ur.roles?.name).filter(Boolean) || [];
      setUserRoles(roles);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Profile might not exist yet for new users — that's okay
      setProfile(null);
      setUserRoles(['Member']);
    }
  };

  const login = async (email, password) => {
    const data = await authService.signInWithPassword(email, password);
    return data;
  };

  const register = async ({ email, password, firstName, lastName }) => {
    const data = await authService.signUp({ email, password, firstName, lastName });
    return data;
  };

  const loginWithGoogle = async () => {
    const data = await authService.signInWithGoogle();
    return data;
  };

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

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await authService.updateProfile(user.id, updates);
    setProfile(prev => ({ ...prev, ...updated }));
    return updated;
  };

  /**
   * Check if current user has a specific role
   */
  const hasRole = (roleName) => {
    if (roleName === 'Super Admin' && userRoles.includes('Super Admin')) return true;
    return userRoles.includes(roleName);
  };

  const isAdmin = () => hasRole('Super Admin');
  const isContentManager = () => hasRole('Super Admin') || hasRole('Content Manager');
  const isVillageRep = () => hasRole('Village Representative');
  const isSchoolRep = () => hasRole('School Representative');

  const value = {
    // State
    user,
    profile,
    userRoles,
    isAuthenticated,
    isLoadingAuth,
    authChecked,
    authError,

    // Auth actions
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    checkSession,

    // Role checks
    hasRole,
    isAdmin,
    isContentManager,
    isVillageRep,
    isSchoolRep,

    // Backward compatibility
    isLoadingPublicSettings: false,
    appPublicSettings: null,
    navigateToLogin: () => { window.location.href = '/login'; },
    checkUserAuth: checkSession,
    checkAppState: checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
