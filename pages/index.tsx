import gql from "graphql-tag";
import React, { useState, useEffect } from "react";
import { useLazyQuery } from "react-apollo";
import store from "store-js";
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
  id: string;
  name: string;
  email: string;
}

interface ShopData {
  shop: ShopInformation;
}

function Index() {
  const [open, setValue] = useState(false);
  const ids: string[] | undefined = store.get("ids");
  const [idsLength, setIdsLength] = useState(ids ? ids.length: 0);

  const handleSelection = (resources: SelectPayload) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    setValue(false);
    store.set("ids", idsFromResources);
    setIdsLength(idsFromResources.length);
  };

  const [shopInfo, setShopInfo] = useState<ShopInformation>();
  const [loadShopInfo, { called, loading, data, error }] = useLazyQuery<ShopData>(GET_SHOP_INFOMATION);

  useEffect(() => {
    if (!called) {
      loadShopInfo();
    }
    if (loading === false && data) {
      console.log("shopId: " + data.shop.id);
      setShopInfo(data.shop);
    }
    if (error) {
      console.log(error.message);
    }
  }, [called, loading]);

  return (
    <Page>
      <TitleBar
        title={shopInfo ? shopInfo.name : "Shopify app with Node and React 🎉"}
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
      {idsLength == 0 ? (
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
