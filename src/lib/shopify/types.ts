export type ShopifyCredentials = {
  storeDomain: string;
  accessToken: string;
};

export type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  status: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
  }>;
};

export type ShopifyPriceEntry = {
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  price: number;
  currency: string;
  sku: string;
};

/** Map of course slug → live Shopify price entry */
export type ShopifyPriceMap = Record<string, ShopifyPriceEntry>;
