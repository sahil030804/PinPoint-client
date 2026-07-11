'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [workspaceRole, setWorkspaceRole] = useState(null);

  async function fetchUser() {
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.data);
        setWorkspaceRole(res.data.role);
        return res.data;
      } else {
        localStorage.removeItem('pp_token');
        api.setToken(null);
      }
    } catch {
      localStorage.removeItem('pp_token');
      api.setToken(null);
    }
    return null;
  }

  async function fetchWorkspaceUserRole(workspaceId) {
    try {
      const res = await api.get(`/auth/me?workspaceId=${workspaceId}`);
      if (res.success) {
        setWorkspaceRole(res.data.role);
      }
    } catch {
      // fallback: role stays as-is
    }
  }

  async function fetchWorkspaces() {
    const res = await api.get('/workspaces');
    if (res.success) {
      setWorkspaces(res.data);
      return res.data;
    }
    return [];
  }

  // Fetch role whenever active workspace changes
  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkspaceUserRole(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  // Restore active workspace on mount
  useEffect(() => {
    const token = localStorage.getItem('pp_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.setToken(token);
    (async () => {
      const [u, ws] = await Promise.all([fetchUser(), fetchWorkspaces()]);
      if (u) {
        const stored = localStorage.getItem('pp_active_workspace');
        if (stored && ws.some((w) => w.id === stored)) {
          setActiveWorkspaceId(stored);
        } else if (ws.length > 0) {
          setActiveWorkspaceId(ws[0].id);
        }
      }
      setLoading(false);
    })();
  }, []);

  const switchWorkspace = useCallback((workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem('pp_active_workspace', workspaceId);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('pp_token', res.data.token);
      api.setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.role) {
        setWorkspaceRole(res.data.user.role);
      }
      const ws = await fetchWorkspaces();
      if (res.data.user.workspaceId) {
        setActiveWorkspaceId(res.data.user.workspaceId);
      } else if (ws.length > 0) {
        setActiveWorkspaceId(ws[0].id);
      }
    }
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.success) {
      localStorage.setItem('pp_token', res.data.token);
      api.setToken(res.data.token);
      setUser(res.data.user);
      const ws = await fetchWorkspaces();
      if (res.data.user?.workspaceId) {
        setActiveWorkspaceId(res.data.user.workspaceId);
      } else if (ws.length > 0) {
        setActiveWorkspaceId(ws[0].id);
      }
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout locally regardless of server response
    }
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_active_workspace');
    api.setToken(null);
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    window.location.href = '/auth/login';
  }, []);

  // Override user.workspaceId with the active workspace
  const exposedUser = user ? { ...user, workspaceId: activeWorkspaceId || user.workspaceId } : null;

  const refreshWorkspaceRole = useCallback(async () => {
    if (activeWorkspaceId) {
      await fetchWorkspaceUserRole(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  const refreshWorkspaces = useCallback(async () => {
    const ws = await fetchWorkspaces();
    if (!activeWorkspaceId && ws.length > 0) {
      setActiveWorkspaceId(ws[0].id);
    }
    return ws;
  }, [activeWorkspaceId]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user: exposedUser, loading, workspaces, activeWorkspaceId, workspaceRole, login, register, logout, switchWorkspace, refreshWorkspaceRole, refreshWorkspaces, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
