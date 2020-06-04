import gql from "graphql-tag";
import React, { useEffect, useState, useCallback } from "react";
import { useLazyQuery, useMutation } from "react-apollo";
import {
  Page,
  Card,
  TextField,
  EmptyState,
  Layout,
  Toast,
  Frame,
} from "@shopify/polaris";

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
  metafield?: Metafield;
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

const UPDATE_COLLECTIONS_METAFIELDS = gql`
  mutation collectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
      }
      job {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface UpdateResultUserErrors {
  field: string[];
  message: string;
}

interface UpdateResult {
  collection?: {
    id: string;
  };
  job?: {
    id: string;
  };
  userErrors: UpdateResultUserErrors[];
}

interface UpdateInputVars {
  id: string;
  metafields: Metafield;
}

interface CollectionState {
  id: string;
  title: string;
  description: string;
  metafieldId?: string | null;
  value?: string | null;
}

function CollectionsPage() {
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const toastMarkup = active ? (
    <Toast content="Sucessfully updated" onDismiss={toggleActive} />
  ) : null;
  const [values, setValues] = useState<CollectionState[]>([]);
  const [loadCollectionsInfo, { called, loading, data, error }] = useLazyQuery<
    CollectionsData,
    CollectionsVars
  >(GET_COLLECTIONS_METAFIELDS, {
    variables: {
      namespace: "tutorial",
      key: "discount_percentage",
    },
  });
  const [
    saveCollectionInfo,
    { error: updated_error, data: updated_data },
  ] = useMutation<
    { collectionUpdate: UpdateResult },
    { input: UpdateInputVars }
  >(UPDATE_COLLECTIONS_METAFIELDS);

  useEffect(() => {
    if (!called) {
      loadCollectionsInfo();
    }
    if (loading === false && data) {
      console.log(data);
      const result = data.collections.edges.map((edge) => {
        return {
          id: edge.node.id,
          title: edge.node.title,
          description: edge.node.description,
          metafieldId: edge.node.metafield ? edge.node.metafield.id : null,
          value: edge.node.metafield ? edge.node.metafield.value : null,
        };
      });
      console.log(result);
      setValues(result);
    }
    if (error) {
      console.log(error.message);
    }
  }, [called, loading]);

  return (
    <Frame>
      <Page title="Collections">
        {values.length == 0 ? (
          <Layout>
            <EmptyState image={img}></EmptyState>
          </Layout>
        ) : (
          <Layout>
            {toastMarkup}
            {values.map((value, index) => {
              return (
                <Layout.AnnotatedSection
                  title={value.title}
                  description={value.description}
                  key={value.id}
                >
                  <Card
                    sectioned
                    secondaryFooterActions={[{ content: "Clear Value" }]}
                    primaryFooterAction={{
                      content: "Save Value",
                      onAction: () => {
                        const inputData: UpdateInputVars = {
                          id: value.id,
                          metafields: {
                            namespace: "tutorial",
                            key: "discount_percentage",
                            value: value.value ?? "10",
                            valueType: "INTEGER",
                          },
                        };
                        if (value.metafieldId) {
                          inputData.metafields.id = value.metafieldId;
                        }
                        saveCollectionInfo({
                          variables: {
                            input: inputData,
                          },
                        }).then((result) => {
                          if (result.data && result.data.collectionUpdate) {
                            console.log("Sucessfully updated");
                            toggleActive();
                          }
                          if (result.errors) {
                            result.errors.forEach(e => {
                              console.log(e.message);
                            })
                          }
                        });
                      },
                    }}
                  >
                    <TextField
                      label="value"
                      onChange={(e) => {
                        const newValues = values.slice(0);
                        values[index].value = e;
                        setValues(newValues);
                      }}
                      value={value.value ?? ""}
                    />
                  </Card>
                </Layout.AnnotatedSection>
              );
            })}
          </Layout>
        )}
      </Page>
    </Frame>
  );
}

export default CollectionsPage;
