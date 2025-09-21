import React, { createContext, useState, useContext, useCallback } from 'react';
import { useClients } from '../hooks/useClients';
import type { Client, AuthContextType } from '../types';
import * as api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { addClient, loading: clientsLoading } = useClients();
    const [currentUser, setCurrentUser] = useState<Client | null>(null);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        const user = await api.getClientByEmail(email);
        if (user && user.password === password) { // Plain text password check
            setCurrentUser(user);
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
        return { success: true, message: "Account created successfully!" };
    }, [addClient]);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const value = {
        currentUser,
        login,
        signup,
        logout,
        loading: clientsLoading,
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
