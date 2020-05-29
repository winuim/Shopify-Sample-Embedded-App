import React, { useState, useEffect } from "react";
import {
  Banner,
  Card,
  DisplayText,
  Form,
  FormLayout,
  Frame,
  Layout,
  Page,
  PageActions,
  TextField,
  Toast,
} from "@shopify/polaris";
import store from "store-js";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Redirect } from "@shopify/app-bridge/actions";
import Cookies from "js-cookie";
import createApp from "@shopify/app-bridge";

interface Product {
  title: string;
}

interface ProductVariant {
  id: string;
  price: string;
}

interface ProductData {
  product: Product;
  productVariant: ProductVariant;
}

const UPDATE_PRICE = gql`
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      product {
        title
      }
      productVariant {
        id
        price
      }
    }
  }
`;

function EditProduct() {
  const shopOrigin = Cookies.get("shopOrigin") ?? "error";
  const app = createApp({
    apiKey: API_KEY,
    shopOrigin: shopOrigin,
  });
  const redirectToIndex = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, "/index");
  };

  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("");
  const [price, setPrice] = useState("");
  const [variantId, setVariantId] = useState("");
  const [productId, setProductId] = useState("");
  const [, setShowToast] = useState(false);

  function itemToBeConsumed() {
    const item = store.get("item");
    console.log("get item, " + JSON.stringify(item));
    const title = item.title;
    const price = item.variants.edges[0].node.price;
    const variantId = item.variants.edges[0].node.id;
    const productId = item.id;
    const discounter = price * 0.1;
    setName(title);
    setPrice(price);
    setVariantId(variantId);
    setProductId(productId);
    return (price - discounter).toFixed(2);
  }

  useEffect(() => {
    const discount = itemToBeConsumed();
    setDiscount(discount);
  }, [variantId]);

  return (
    <Mutation<{ productVariantUpdate: ProductData }, { input: ProductVariant }>
      mutation={UPDATE_PRICE}
    >
      {(handleSubmit, { error, data }) => {
        const showError = error && (
          <Banner status="critical">{error.message}</Banner>
        );
        const showToast = data && data.productVariantUpdate && (
          <Toast
            content="Sucessfully updated"
            onDismiss={() => setShowToast(false)}
          />
        );
        return (
          <Frame>
            <Page>
              <Layout>
                {showToast}
                <Layout.Section>{showError}</Layout.Section>
                <Layout.Section>
                  <DisplayText size="large">{name}</DisplayText>
                  <Form onSubmit={() => {}}>
                    <Card sectioned>
                      <FormLayout>
                        <FormLayout.Group>
                          <TextField
                            prefix="$"
                            value={price}
                            disabled
                            label="Original price"
                            name="price"
                          />
                          <TextField
                            prefix="$"
                            value={discount}
                            onChange={setDiscount}
                            label="Discounted price"
                            name="discount"
                          />
                        </FormLayout.Group>
                        <p>This sale price will expire in two weeks</p>
                      </FormLayout>
                    </Card>
                    <PageActions
                      primaryAction={{
                        content: "Save",
                        onAction: () => {
                          handleSubmit({
                            variables: {
                              input: {
                                id: variantId,
                                price: discount,
                              },
                            },
                          });
                        },
                      }}
                      secondaryActions={[
                        {
                          content: "Remove discount",
                          onAction: () => {
                            const ids: string[] = store.get("ids");
                            const new_ids = ids.filter(v => v !== productId);
                            store.set("ids", new_ids);
                            redirectToIndex();
                          },
                        },
                      ]}
                    />
                  </Form>
                </Layout.Section>
              </Layout>
            </Page>
          </Frame>
        );
      }}
    </Mutation>
  );
}

export default EditProduct;
