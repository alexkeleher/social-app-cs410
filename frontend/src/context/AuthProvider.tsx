// src/context/AuthProvider.jsx
import { createContext, useState, useEffect, ReactNode } from 'react';

// Define the auth state interface
interface AuthState {
    token?: string;
    id?: number;
    email?: string;
}

// Define the context type
interface AuthContextType {
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
    loading: boolean; // Add this line
}

// Create context with initial state
const AuthContext = createContext<AuthContextType>({
    auth: {},
    setAuth: () => {},
    loading: true,
});

// Define props interface for AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        // Check localStorage when component mounts
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setAuth({
                token,
                id: decoded.id,
                email: decoded.email,
            });
        }
        setLoading(false); // Set loading to false when done
    }, []);

    return <AuthContext.Provider value={{ auth, setAuth, loading }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
