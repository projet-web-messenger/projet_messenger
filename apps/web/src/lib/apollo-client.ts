import { ApolloLink, HttpLink, split } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/client-integration-nextjs";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// URLs depuis .env.local
const HTTP_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";
const WS_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || "ws://localhost:4000/graphql";

// Fonction pour créer le client Apollo
export function makeClient() {
  const httpLink = new HttpLink({
    uri: HTTP_URL,
    fetchOptions: {},
  });

  // Côté serveur : pas de WebSocket
  if (typeof window === "undefined") {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        new SSRMultipartLink({ stripDefer: true }),
        httpLink,
      ]),
    });
  }

  // Côté client : split HTTP/WS pour les subscriptions
  const wsLink = new GraphQLWsLink(
    createClient({
      url: WS_URL,
    })
  );

  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return (
        def.kind === "OperationDefinition" && def.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
  });
}

// Pour compatibilité avec ton code existant
export function getClient() {
  return makeClient();
}
