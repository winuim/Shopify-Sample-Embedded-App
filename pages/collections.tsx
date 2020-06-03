import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import { useLazyQuery } from "react-apollo";
import { Page, Card, TextField, EmptyState, Layout } from "@shopify/polaris";

import { PageInfo, Metafield } from "utils/gql-common";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

const GET_COLLECTIONS_METAFIELDS = gql`
  query getCollectionsMetafield($namespace: String!, $key: String!) {
    collections(first: 10) {
      edges {
        node {
          id
          title
          description
          metafield(namespace: $namespace, key: $key) {
            id
            namespace
            key
            valueType
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

interface CollectionNode {
  id: string;
  title: string;
  description: string;
  metafield: Metafield | null;
}

interface CollectionEdge {
  node: CollectionNode;
}

interface CollectionInfo {
  edges: CollectionEdge[];
  pageInfo: PageInfo;
}

interface CollectionsData {
  collections: CollectionInfo;
}

interface CollectionsVars {
  namespace: string;
  key: string;
}

function CollectionsPage() {
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>();
  const [loadCollectionsInfo, { called, loading, data, error }] = useLazyQuery<
    CollectionsData,
    CollectionsVars
  >(GET_COLLECTIONS_METAFIELDS, {
    variables: {
      namespace: "tutorial",
      key: "discount_percentage",
    },
  });

  useEffect(() => {
    if (!called) {
      loadCollectionsInfo();
    }
    if (loading === false && data) {
      console.log(data);
      setCollectionInfo(data.collections);
    }
    if (error) {
      console.log(error.message);
    }
  }, [called, loading]);

  return (
    <Page title="Collections">
      {collectionInfo === undefined ? (
        <Layout>
          <EmptyState image={img}></EmptyState>
        </Layout>
      ) : (
        <Layout>
          {collectionInfo.edges.map((edge) => {
            return (
              <Layout.AnnotatedSection
                title={edge.node.title}
                description={edge.node.description}
                key={edge.node.id}
              >
                <Card
                  sectioned
                  secondaryFooterActions={[{ content: "Clear Value" }]}
                  primaryFooterAction={{ content: "Save Value" }}
                >
                  <TextField
                    label="value"
                    onChange={() => {}}
                    value={edge.node.metafield?.value}
                  />
                </Card>
              </Layout.AnnotatedSection>
            );
          })}
        </Layout>
      )}
    </Page>
  );
}

export default CollectionsPage;
