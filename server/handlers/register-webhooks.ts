import { registerWebhook, Topic } from "@shopify/koa-shopify-webhooks";
import { ApiVersion } from "@shopify/koa-shopify-webhooks/dist/src/register";

export const registerWebhooks = async (
  shop: string,
  accessToken: string,
  type: Topic,
  url: string,
  apiVersion: ApiVersion
) => {
  const registration = await registerWebhook({
    address: `${process.env.HOST}${url}`,
    topic: type,
    accessToken,
    shop,
    apiVersion,
  });

  if (registration.success) {
    console.log("Successfully registered webhook!");
  } else {
    console.log(
      "Failed to register webhook",
      registration.result.data.webhookSubscriptionCreate
    );
  }
};
