/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it
import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { client } from "./src/apollo/client";

export const wrapRootElement = ({ element }) => {
    return (
        <ApolloProvider client={client}>
        {element}
        </ApolloProvider>
    );
};