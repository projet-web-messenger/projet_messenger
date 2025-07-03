import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

//Config lien HTTP pour les queries et mutations
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql",
  credentials: "same-origin",
});

//Config du lien socket pour les subscriptions
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || "ws://localhost:3000/graphql",
          connectionParams: {
            // You can add any connection parameters here if needed
          },
        }),
      )
    : null;

//Séparation des liens : HTTP pour Q/M et WS pour les subscriptions
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === "OperationDefinition" && definition.operation === "subscription";
        },
        wsLink,
        httpLink,
      )
    : httpLink;

//Config du client Apollo
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
