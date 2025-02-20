import { env } from "@/env";
import { GoogleAdsApi } from "google-ads-api";
import { google } from "googleapis";
//https://developers.google.com/google-ads/api/docs/oauth/cloud-project

const googleRedirectUri = `${env.BASE_URL}/api/oauth/google/callback`;

export const googleOAuth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri
);

const googleAdsClient = new GoogleAdsApi({
  client_id: env.GOOGLE_CLIENT_ID,
  client_secret: env.SHOPIFY_CLIENT_SECRET,
  developer_token: env.GOOGLE_DEVELOPER_TOKEN,
});

export const initGoogleOAuth = () => {
  const redirectUrl = googleOAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/adwords",
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
    prompt: "consent",
  });
  return redirectUrl;
};

export const readGoogleAdAccounts = async (refresh_token: string) => {
  try {
    const googleAdAccounts = await googleAdsClient.listAccessibleCustomers(refresh_token);
  } catch (e) {
    console.log(e);
    return false;
  }
};
