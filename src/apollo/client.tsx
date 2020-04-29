import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import customFetch from "isomorphic-fetch";

const httpLink = new HttpLink({
    uri: 'http://localhost:8000/__graphql',
    credentials: "same-origin",
    fetch: customFetch
  });

  export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });