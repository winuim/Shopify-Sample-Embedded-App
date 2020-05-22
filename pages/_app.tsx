import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { ApolloProvider } from "react-apollo";
import { Provider } from "@shopify/app-bridge-react";
import Cookies from "js-cookie";
import "@shopify/polaris/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import ApolloClient from "apollo-boost";
import { AppProvider } from "@shopify/polaris";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include",
  },
});

function MyApp({ Component, pageProps }: AppProps) {
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

export default MyApp;
