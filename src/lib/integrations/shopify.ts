import { env } from "@/env";
import crypto from "node:crypto";

const shopifyRedirectUri = () => encodeURIComponent(`${env.BASE_URL}/api/oauth/shopify/callback`);
const generateShopifyState = () => crypto.randomBytes(20).toString("hex");

export const initShopifyOAuth = (shop_url: string) => {
  return `https://${shop_url}/admin/oauth/authorize?client_id=${env.SHOPIFY_CLIENT_ID}&scope=read_orders&redirect_uri=${shopifyRedirectUri()}&state=${generateShopifyState()}`;
};

export const validateShopifyMessage = (hmac: string, message: string) => {
  const cryptoHmac = crypto.createHmac("sha256", env.SHOPIFY_CLIENT_SECRET);
  cryptoHmac.update(message);
  const calculatedDigest = cryptoHmac.digest("hex");

  const calculatedBuffer = Buffer.from(calculatedDigest, "hex");
  const receivedBuffer = Buffer.from(hmac, "hex");

  if (!crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)) return false;
  return true;
};

export const validateShopifyShopUrl = (shop_url: string) => {
  const regex = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/);
  return regex.test(shop_url);
};

interface ShopifyAccessTokenResponse {
  access_token: string;
  scope: string;
}

export const exchangeShopifyCode = async (shop_url: string, code: string) => {
  try {
    const response = await fetch(
      `https://${shop_url}/admin/oauth/access_token?client_id=${env.SHOPIFY_CLIENT_ID}&client_secret=${env.SHOPIFY_CLIENT_SECRET}&code=${code}`,
      { method: "POST" }
    );
    let data;

    if (response.ok) {
      data = (await response.json()) as ShopifyAccessTokenResponse;
    } else {
      data = (await response.json()) as any;
      throw new Error(`Shopify API Error: ${await response.text()}`);
    }

    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};
