"use client";

import React from "react";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { HttpLink } from "@apollo/client/link/http";

// ✅ Crear cliente Apollo con token y endpoint correcto
function makeClient() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL ||
        "http://localhost:8000/graphql", // ✅ usa el endpoint correcto
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      fetchOptions: { cache: "no-store" },
    }),
  });
}

// ✅ Envolvemos toda la app con el proveedor de Apollo
export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
