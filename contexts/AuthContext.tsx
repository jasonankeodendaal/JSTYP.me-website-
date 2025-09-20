import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useClients } from '../hooks/useClients';
import type { Client, AuthContextType } from '../types';
import * as api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { clients, addClient, loading: clientsLoading } = useClients();
    const [currentUser, setCurrentUser] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const storedUserId = sessionStorage.getItem('jstyp-current-user-id');
                if (storedUserId && !clientsLoading) {
                    const user = await api.getClientById(storedUserId);
                    setCurrentUser(user || null);
                }
            } catch (e) {
                console.error("Failed to retrieve current user", e);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, [clientsLoading]);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        const user = await api.getClientByEmail(email);
        if (user && user.password === password) { // Plain text password check
            setCurrentUser(user);
            sessionStorage.setItem('jstyp-current-user-id', user.id);
            return { success: true, message: "Logged in successfully!" };
        }
        return { success: false, message: "Invalid email or password." };
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
        const existingUser = await api.getClientByEmail(email);
        if (existingUser) {
            return { success: false, message: "An account with this email already exists." };
        }
        const newUser = await addClient({ name, email, password });
        setCurrentUser(newUser);
        sessionStorage.setItem('jstyp-current-user-id', newUser.id);
        return { success: true, message: "Account created successfully!" };
    }, [addClient]);

    const logout = useCallback(() => {
        setCurrentUser(null);
        sessionStorage.removeItem('jstyp-current-user-id');
    }, []);

    const value = {
        currentUser,
        login,
        signup,
        logout,
        loading: loading || clientsLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};