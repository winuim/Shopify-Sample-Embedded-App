export type MetafieldValueTypes = "STRING" | "INTEGER" | "JSON_STRING";

export interface Metafield {
  id: string;
  namespace: string;
  key: string;
  valueType: MetafieldValueTypes;
  value: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
