declare var API_KEY: string;

import "@shopify/polaris/styles.css";

import ApolloClient from "apollo-boost";
import Cookies from "js-cookie";
import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";
import { ApolloProvider } from "react-apollo";
import { Provider } from "@shopify/app-bridge-react";
import { AppProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include",
  },
});

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const config = {
    apiKey: API_KEY,
    shopOrigin: Cookies.get("shopOrigin") ?? "error",
    forceRedirect: true,
  };

  return (
    <React.Fragment>
      <Head>
        <title>Sample App</title>
        <meta charSet="utf-8" />
      </Head>
      <Provider config={config}>
        <AppProvider i18n={translations}>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
          </ApolloProvider>
        </AppProvider>
      </Provider>
    </React.Fragment>
  );
}
