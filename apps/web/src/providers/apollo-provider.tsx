"use client";

import { ApolloProvider } from "@apollo/client";
import { makeClient } from "@/lib/apollo-client";
import { useMemo } from "react";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  // ✅ Créer le client Apollo une seule fois
  const client = useMemo(() => makeClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;