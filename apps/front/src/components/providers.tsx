"use client";

import { ApolloProvider } from "@apollo/client/react";
import client from "@/lib/apollo-client";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <AuthProvider>
                <CartProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </CartProvider>
            </AuthProvider>
        </ApolloProvider>
    );
}
