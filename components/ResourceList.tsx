import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import store from "store-js";
import { Redirect } from "@shopify/app-bridge/actions";
import Cookies from "js-cookie";
import createApp from "@shopify/app-bridge";

interface ProductImageNode {
  originalSrc: string;
  altText: string;
}

interface ProductImageEdge {
  node: ProductImageNode;
}

interface ProductImage {
  edges: ProductImageEdge[];
}

interface ProductVariantNode {
  price: number;
  id: string;
}

interface ProductVariantEdge {
  node: ProductVariantNode;
}

interface ProductVariant {
  edges: ProductVariantEdge[];
}

interface ProductNode {
  title: string;
  handle: string;
  descriptionHtml: string;
  id: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface ProductData {
  nodes: ProductNode[];
}

interface ProductVars {
  ids: string[];
}

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

function ResourceListWithProducts() {
  const shopOrigin = Cookies.get("shopOrigin") ?? "error";
  const app = createApp({
    apiKey: API_KEY,
    shopOrigin: shopOrigin,
  });
  const redirectToProduct = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, "/edit-products");
  };

  const twoWeeksFromNow = new Date(Date.now() + 12096e5).toDateString();

  return (
    <Query<ProductData, ProductVars>
      query={GET_PRODUCTS_BY_ID}
      variables={{ ids: store.get("ids") }}
    >
      {({ loading, data, error }) => {
        if (loading) {
          return <div>Loading…</div>;
        }
        if (error) {
          return <div>{error.message}</div>;
        }
        if (data === undefined) {
          return <div>DATA UNDEFINED</div>;
        }
        console.log(JSON.stringify(data));
        return (
          <Card>
            <ResourceList
              showHeader
              resourceName={{ singular: "Product", plural: "Products" }}
              items={data.nodes}
              renderItem={(item) => {
                const media = (
                  <Thumbnail
                    source={
                      item.images.edges[0]
                        ? item.images.edges[0].node.originalSrc
                        : ""
                    }
                    alt={
                      item.images.edges[0]
                        ? item.images.edges[0].node.altText
                        : ""
                    }
                  />
                );
                const price = item.variants.edges[0].node.price;
                return (
                  <ResourceList.Item
                    id={item.id}
                    media={media}
                    accessibilityLabel={`View details for ${item.title}`}
                    onClick={() => {
                      store.set("item", item);
                      redirectToProduct();
                    }}
                  >
                    <Stack>
                      <Stack.Item fill>
                        <h3>
                          <TextStyle variation="strong">{item.title}</TextStyle>
                        </h3>
                      </Stack.Item>
                      <Stack.Item>
                        <p>${price}</p>
                      </Stack.Item>
                      <Stack.Item>
                        <p>Expires on {twoWeeksFromNow} </p>
                      </Stack.Item>
                    </Stack>
                  </ResourceList.Item>
                );
              }}
            />
          </Card>
        );
      }}
    </Query>
  );
}

export default ResourceListWithProducts;
