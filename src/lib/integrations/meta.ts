import { env } from "@/env.js";
import { eq, lte } from "drizzle-orm";
import { db } from "../db/drizzle";
import { metaAccounts } from "../db/schema";

const metaRedirectUri = () => encodeURIComponent(`${env.BASE_URL}/api/oauth/meta/callback`);

export const initMetaOAuth = () => {
  return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${env.META_APP_ID}&redirect_uri=${metaRedirectUri()}&scope=email,ads_read,ads_management,read_insights`;
};

const buildMetaHeaders = (access_token: string) => {
  return {
    Authorization: `Bearer ${access_token}`,
  };
};

interface MetaApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subscode: number;
    fbtrace_id: string;
  };
}

const buildMetaError = (error: MetaApiErrorResponse) => {
  return new Error(`Meta API Error: ${JSON.stringify(error)}`);
};

///
/// Get access token from oAuth code
///

interface MetaAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: undefined | null | number; //Number of seconds until token expires
}

export const getMetaAccessToken = async (code: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${env.META_APP_ID}&redirect_uri=${metaRedirectUri()}&client_secret=${env.META_APP_SECRET}&code=${code}`
    );
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaAccessTokenResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    console.log(data);

    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

///
/// Get user details for access token
///

interface MetaGetUserResponse {
  name: string;
  id: string;
}

export const getMetaUser = async (access_token: string) => {
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/me`, {
      headers: buildMetaHeaders(access_token),
    });
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaGetUserResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

interface MetaApiPaging {
  cursors: {
    before: string;
    after: string;
  };
}

///
/// Fetch a list of ad accounts
///

interface MetaGetAdAccountsResponse {
  data: MetaApiAdAccount[];
  paging: MetaApiPaging;
}

interface MetaApiAdAccount {
  account_id: string;
  id: string;
}

export const getMetaAdAccounts = async (access_token: string) => {
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts`, {
      headers: buildMetaHeaders(access_token),
    });
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaGetAdAccountsResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    return data.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

///
/// Get campaigns under an ad account
///

interface MetaGetAdCampaignsResponse {
  data: MetaApiCampaign[];
  paging: MetaApiPaging;
}

interface MetaApiCampaign {
  id: string;
  name: string;
  created_time: string;
  daily_budget: string;
  objective: string;
  status: "ACTIVE" | "PASUED" | "DELETED" | "ARCHIVED";
}

export const getMetaAdAccountCampaigns = async (access_token: string, ad_account_id: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${ad_account_id}/campaigns?fields=id,name,created_time,daily_budget,objective,status`,
      {
        headers: buildMetaHeaders(access_token),
      }
    );
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaGetAdCampaignsResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    return data.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

///
/// Get Meta Object (ad_account_id, campaign_id) Ads List
///

interface MetaGetAdsListResponse {
  data: MetaApiAd[];
  paging: MetaApiPaging;
}

interface MetaApiAd {
  id: string;
  name: string;
}

export const getMetaObjectAdsList = async (access_token: string, object_id: string) => {
  try {
    const response = await fetch(`https://graph.facebook.com/v22.0/${object_id}/ads?fields=name`, {
      headers: buildMetaHeaders(access_token),
    });
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaGetAdsListResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    return data.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

///
/// Get Meta Object (ad_account_id, adset_id, campaign_id, ad_id) Insights
///

interface MetaGetInsightsResponse {
  data: MetaApiInsight[];
  paging: MetaApiPaging;
}

interface MetaApiInsight {
  spend: string;
  impressions: string;
  actions: {
    action_type: string;
    value: string;
  }[];
  cost_per_action_type: {
    action_type: string;
    value: string;
  }[];
  date_start: string;
  date_stop: string;
}

export const getMetaObjectInsights = async (access_token: string, object_id: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${object_id}/insights?fields=impressions,spend,actions,cost_per_action_type,account_currency&date_preset=maximum&level=ad&time_increment=1`,
      {
        headers: buildMetaHeaders(access_token),
      }
    );
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaGetInsightsResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    return data.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

///
/// Refresh Meta acccount access token
///
export const refreshMetaAuthorization = async (access_token: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}&redirect_uri=${metaRedirectUri()}&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${access_token}`
    );
    let data;

    if (response.ok) {
      data = (await response.json()) as MetaAccessTokenResponse;
    } else {
      data = (await response.json()) as MetaApiErrorResponse;
      throw buildMetaError(data);
    }

    console.log(data);

    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

///
/// Refresh soon-to-expire Meta ad account tokens
///

export const refreshMetaAuthorizations = async () => {
  const accounts = await db.query.metaAccounts.findMany({
    where: lte(metaAccounts.expiresAt, new Date(new Date().getTime() + 8.64e7)), //expiresAt < 1 day
  });

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]!;

    const newAccessToken = await refreshMetaAuthorization(account.accessToken);
    if (!newAccessToken) {
      await db
        .update(metaAccounts)
        .set({
          valid: false,
        })
        .where(eq(metaAccounts.id, account.id));
      continue;
    }

    const expiresSec = newAccessToken.expires_in ? newAccessToken.expires_in * 60 : null;
    await db
      .update(metaAccounts)
      .set({
        accessToken: newAccessToken.access_token,
        expiresAt: newAccessToken.expires_in ? new Date(new Date().getTime() + expiresSec!) : null,
      })
      .where(eq(metaAccounts.id, account.id));
  }
};
