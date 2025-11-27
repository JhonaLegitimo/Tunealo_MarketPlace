// context/AuthContext.tsx

"use client"; // Asegúrate de que este archivo se ejecute en el cliente.

import React, { createContext, useContext, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    // Aquí puedes guardar el token en localStorage o cookies si lo necesitas
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // También puedes limpiar el localStorage o cookies aquí
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
