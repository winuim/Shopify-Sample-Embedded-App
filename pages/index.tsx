import React, { useState, useEffect } from "react";
import gql from "graphql-tag";
import store from "store-js";
import { useQuery } from '@apollo/react-hooks';
import { EmptyState, Layout, Page } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import { SelectPayload } from "@shopify/app-bridge-react/components/ResourcePicker/ResourcePicker";

import ResourceListWithProducts from "../components/ResourceList";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

const GET_SHOP_INFOMATION = gql`
query {
  shop {
    id
    name
    email
  }
}
`;

interface ShopInformation {
  "id": string,
  "name": string,
  "email": string
}

interface ShopData {
  "shop": ShopInformation
}

function Index() {
  const [open, setValue] = useState(false);
  const emptyState = !store.get("ids");

  const handleSelection = (resources: SelectPayload) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    setValue(false);
    store.set("ids", idsFromResources);
  };

  const { loading, data, error } = useQuery<ShopData>(
    GET_SHOP_INFOMATION
  );
  const [shopInfo, setShopInfo] = useState<ShopInformation>({
    "id": "",
    "name": "",
    "email": ""  
  });

  useEffect(() => {
    if (loading === false && data) {
      setShopInfo(data.shop);
      console.log("shopId: " + data.shop.id);
    }
    if (error) {
      alert(error.message);
    }
  },[loading, data]);

  return (
    <Page>
      <TitleBar
        title={loading ? (
          "Shopify app with Node and React 🎉"
        ):(
          shopInfo.name
        )}
        primaryAction={{
          content: "Select products",
          onAction: () => setValue(true),
        }}
      />
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={handleSelection}
        onCancel={() => setValue(false)}
      />
      {emptyState ? (
        <Layout>
          <EmptyState
            heading="Discount your products temporarily"
            action={{
              content: "Select products",
              onAction: () => setValue(true),
            }}
            image={img}
          >
            <p>Select products to change their price temporarily.</p>
          </EmptyState>
        </Layout>
      ) : (
        <ResourceListWithProducts />
      )}
    </Page>
  );
}

export default Index;
