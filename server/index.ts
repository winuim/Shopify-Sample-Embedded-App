import "@babel/polyfill";
import "isomorphic-fetch";
import dotenv from "dotenv";
import Koa from "koa";
import session from "koa-session";
import next from "next";
import Router from "@koa/router";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import * as Register from "@shopify/koa-shopify-webhooks/dist/src/register";

import * as handlers from "./handlers/index";
import DefaultClient from "apollo-boost";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";

export interface KoaApolloClient extends Koa.Context {
  client: DefaultClient<any>;
}

dotenv.config();
const port = parseInt(process.env.PORT ?? "8081", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? "error";
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY ?? "error";
const SCOPES = process.env.SCOPES ?? "error";
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  const webhook = receiveWebhook({
    secret: SHOPIFY_API_SECRET,
  });

  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx: KoaApolloClient) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const shop = ctx.session?.shop;
        const accessToken = ctx.session?.accessToken;
        await handlers.registerWebhooks(
          shop,
          accessToken,
          "PRODUCTS_CREATE",
          "/webhooks/products/create",
          Register.ApiVersion.April20
        );
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });
        ctx.client = handlers.createClient(shop, accessToken);
        await handlers.getSubscriptionUrl(ctx);
      },
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.April20,
    })
  );
  router.post("/webhooks/products/create", webhook, (ctx) => {
    console.log("received webhook: ", ctx.state.webhook);
  });
  router.get("*", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
