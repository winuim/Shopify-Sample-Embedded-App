import React, { useState } from "react";
import { EmptyState, Layout, Page } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import { SelectPayload } from "@shopify/app-bridge-react/components/ResourcePicker/ResourcePicker";

import ResourceListWithProducts from "../components/ResourceList";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

function Index() {
  const [open, setValue] = useState(false);
  const emptyState = !store.get("ids");

  const handleSelection = (resources: SelectPayload) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    setValue(false);
    store.set("ids", idsFromResources);
  };

  return (
    <Page>
      <TitleBar
        title="Shopify app with Node and React 🎉"
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
