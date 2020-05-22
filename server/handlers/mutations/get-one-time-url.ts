import "isomorphic-fetch";
import { gql } from "apollo-boost";

import { KoaApolloClient } from "server/server";

export function ONETIME_CREATE(url: string) {
  return gql`
    mutation {
      appPurchaseOneTimeCreate(
        name: "test"
        price: { amount: 10, currencyCode: USD }
        returnUrl: '${url}'
        test: true
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appPurchaseOneTime {
          id
        }
      }
    }
  `;
}

export const getOneTimeUrl = async (ctx: KoaApolloClient) => {
  const { client } = ctx;
  const confirmationUrl = await client
    .mutate({
      mutation: ONETIME_CREATE(process.env.HOST ?? "error"),
    })
    .then((response) => response.data.appPurchaseOneTimeCreate.confirmationUrl);
  return ctx.redirect(confirmationUrl);
};
