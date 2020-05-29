import gql from "graphql-tag";
import React, { useState, useEffect } from "react";
import { useLazyQuery } from "react-apollo";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  SettingToggle,
  Stack,
  TextField,
  TextStyle,
} from "@shopify/polaris";

const GET_SHOP_METAFIELDS = gql`
query	getShopMetafields($namespace: String!, $key: String!){
  shop {
    id
    name
    email
    metafield(namespace:$namespace, key:$key) {
      id
      namespace
      key
      valueType
      value
    }
  }
}
`;

type MetafieldValueTypes = "STRING" | "INTEGER" | "JSON_STRING"

interface Metafield {
  id: string;
  namespace: string;
  key: string;
  valueType: MetafieldValueTypes;
  value: string;
}

interface ShopInfo {
  id: string;
  name: string;
  email: string;
  metafield: Metafield | null
}

interface ShopData {
  shop: ShopInfo;
}

interface ShopVars {
  namespace: string;
  key: string;
}

function AnnotatedLayout() {
  const [discount, setDiscount] = useState("10%");
  const [enabled, setEnabled] = useState(false);
  const contentStatus = enabled ? "Disable" : "Enable";
  const textStatus = enabled ? "enabled" : "disabled";

  const handleSubmit = (_event: React.FormEvent<HTMLFormElement>) => {
    setDiscount(discount);
    console.log("submission", discount);
  };

  const handleChange = (field: string) => {
    return (value: string | boolean) => {
      switch (field) {
        case "discount":
          if (typeof value === "string") {
            setDiscount(value);
          }
          break;
        case "enabled":
          if (typeof value === "boolean") {
            setEnabled(value);
          }
          break;
      }
    };
  };

  const handleToggle = () => {
    setEnabled(!enabled);
  };

  const [shopInfo, setShopInfo] = useState<ShopInfo>();
  const [loadShopInfo, { called, loading, data, error }] = useLazyQuery<
    ShopData,
    ShopVars
  >(GET_SHOP_METAFIELDS, {
    variables: {
      namespace: "tutorial",
      key: "discount_percentage"
    },
  });

  useEffect(() => {
    if (!called) {
      loadShopInfo();
    }
    if (loading === false && data) {
      console.log(data);
      setShopInfo(data.shop);
      if (data.shop.metafield) {
        const valueType = data.shop.metafield.valueType;
        const value = data.shop.metafield.value;
        if (valueType == "INTEGER") {
          setDiscount(parseInt(value) + "%");
        }
      }
    }
    if (error) {
      console.log(error.message);
    }
  }, [called, loading]);

  return (
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title="Default discount"
          description="Add a product to Sample App, it will automatically be discounted."
        >
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={discount}
                  onChange={handleChange("discount")}
                  label="Discount percentage"
                  name="discount"
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Save
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          title="Price updates"
          description="Temporarily disable all Sample App price updates"
        >
          <SettingToggle
            action={{
              content: contentStatus,
              onAction: handleToggle,
            }}
            enabled={enabled}
          >
            This setting is{" "}
            <TextStyle variation="strong">{textStatus}</TextStyle>.
          </SettingToggle>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}

export default AnnotatedLayout;
