import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminSession } from '../types';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  admin: AdminSession | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get admin profile from admins table
          const { data: adminData } = await supabase
            .from('admins')
            .select('id, email, name')
            .eq('email', session.user.email)
            .single();

          if (adminData) {
            setAdmin({
              id: adminData.id,
              email: adminData.email,
              name: adminData.name,
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('id, email, name')
          .eq('email', session.user.email)
          .single();

        if (adminData) {
          setAdmin({
            id: adminData.id,
            email: adminData.email,
            name: adminData.name,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setIsLoading(false);
        return false;
      }

      // Get admin profile
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, email, name')
        .eq('email', data.user.email)
        .single();

      if (adminError || !adminData) {
        // Not an admin, sign out
        await supabase.auth.signOut();
        setIsLoading(false);
        return false;
      }

      setAdmin({
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
      });

      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
