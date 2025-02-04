import { db } from "@/lib/db/drizzle";
import {
  metaAccounts,
  metaAdAccounts,
  metaAds,
  metaCampaigns,
  metaInsightData,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  getMetaAdAccountCampaigns,
  getMetaAdAccounts,
  getMetaObjectAdsList,
  getMetaObjectInsights,
} from "../meta";

export const syncMeta = async (meta_account_id: number, sync_since?: Date) => {
  const metaAccount = await db.query.metaAccounts.findFirst({
    where: eq(metaAccounts.id, meta_account_id),
  });
  if (!metaAccount) throw new Error(`[${meta_account_id}] Meta account not found in db`);

  const syncAdAccounts = await syncMetaAdAccounts(metaAccount);
  if (!syncAdAccounts) throw new Error(`[${meta_account_id}] Failed to sync ad accounts`);

  for (let i = 0; i < syncAdAccounts.length; i++) {
    let adAccount = syncAdAccounts[i]!;

    const syncAdCampaigns = await syncMetaCampaigns(metaAccount, adAccount);
    if (!syncAdCampaigns)
      throw new Error(
        `[${meta_account_id}:${adAccount.id}] Failed to sync campaigns for ad account`
      );

    for (let z = 0; z < syncAdCampaigns.length; z++) {
      let campaign = syncAdCampaigns[z]!;

      const syncCampaignAds = await syncMetaAds(metaAccount, campaign);
      if (!syncCampaignAds)
        throw new Error(
          `[${meta_account_id}:${adAccount.id}:${campaign.id}] Failed to sync ads for campaign`
        );

      for (let a = 0; a < syncCampaignAds.length; a++) {
        let ad = syncCampaignAds[a]!;

        await syncMetaAdInsights(metaAccount, ad);
      }
    }
  }
};

const syncMetaAdAccounts = async (metaAccount: typeof metaAccounts.$inferSelect) => {
  const adAccounts = await getMetaAdAccounts(metaAccount.accessToken);
  if (!adAccounts) return false;

  let rAdAccounts: (typeof metaAdAccounts.$inferSelect)[] = [];

  for (let i = 0; i < adAccounts.length; i++) {
    let adAccount = adAccounts[i]!;

    const adAccountExists = await db.query.metaAdAccounts.findFirst({
      where: and(
        eq(metaAdAccounts.metaApiAdAccountId, adAccount.id),
        eq(metaAdAccounts.metaAccountId, metaAccount.id)
      ),
    });

    if (adAccountExists) {
      rAdAccounts.push(adAccountExists);
      continue;
    }

    const insertedAdAccounts = await db.insert(metaAdAccounts).values({
      metaApiAdAccountId: adAccount.id,
      metaAccountId: metaAccount.id,
    });

    const insertedAdAccount = insertedAdAccounts.at(0);
    if (!insertedAdAccount) continue;

    rAdAccounts.push(insertedAdAccount);
  }

  return rAdAccounts;
};

const syncMetaCampaigns = async (
  metaAccount: typeof metaAccounts.$inferSelect,
  adAccount: typeof metaAdAccounts.$inferSelect
) => {
  const accountCampaigns = await getMetaAdAccountCampaigns(
    metaAccount.accessToken,
    adAccount.metaApiAdAccountId
  );
  if (!accountCampaigns) {
    console.log(
      `WARN: Failed to get ad campaigns for Meta Ad Account ID ${adAccount.metaApiAdAccountId}`
    );
    return false;
  }

  let rCampaigns: (typeof metaCampaigns.$inferSelect)[] = [];

  for (let z = 0; z < accountCampaigns.length; z++) {
    let adCampaign = accountCampaigns[z]!;

    const campaignExists = await db.query.metaCampaigns.findFirst({
      where: eq(metaCampaigns.metaApiCampaignId, adCampaign.id),
    });
    if (campaignExists) {
      rCampaigns.push(campaignExists);
      continue;
    }

    const insertedCampaigns = await db
      .insert(metaCampaigns)
      .values({
        metaApiCampaignId: adCampaign.id,
        name: adCampaign.name,
        objective: adCampaign.objective,
        status: adCampaign.status,
        metaAdAccountId: adAccount.id,
      })
      .returning();

    const insertedCampaign = insertedCampaigns.at(0);
    if (!insertedCampaign) continue;

    rCampaigns.push(insertedCampaign);
  }

  return rCampaigns;
};

const syncMetaAds = async (
  metaAccount: typeof metaAccounts.$inferSelect,
  campaign: typeof metaCampaigns.$inferSelect
) => {
  const campaignAds = await getMetaObjectAdsList(
    metaAccount.accessToken,
    campaign.metaApiCampaignId
  );
  if (!campaignAds) return false;

  let rAds: (typeof metaAds.$inferSelect)[] = [];

  for (let i = 0; i < campaignAds.length; i++) {
    let ad = campaignAds[i]!;

    const adExixts = await db.query.metaAds.findFirst({
      where: and(eq(metaAds.metaApiAdId, ad.id), eq(metaAds.metaCampaignId, campaign.id)),
    });
    if (adExixts) {
      rAds.push(adExixts);
      continue;
    }

    const insertedAds = await db.insert(metaAds).values({
      metaApiAdId: ad.id,
      name: ad.name,
      metaCampaignId: campaign.id,
    });

    const insertedAd = insertedAds.at(0);
    if (!insertedAd) continue;

    rAds.push(insertedAd);
  }

  return rAds;
};

const syncMetaAdInsights = async (
  metaAccount: typeof metaAccounts.$inferSelect,
  ad: typeof metaAds.$inferSelect,
  sync_since?: Date
) => {
  const adInsights = await getMetaObjectInsights(metaAccount.accessToken, ad.metaApiAdId);
  if (!adInsights) return false;

  if (!sync_since) {
    const fInsights = adInsights.map((i) => ({
      impressions: i.impressions,
      spend: i.spend,

      actions: i.actions,
      cost_per_action_type: i.cost_per_action_type,

      date_start: new Date(i.date_start),
      date_stop: new Date(i.date_stop),

      metaAdId: ad.id,
    }));

    if (!(fInsights.length > 0)) return;

    await db.insert(metaInsightData).values(fInsights);
  }

  // for (let i = 0; i < adInsights.length; i++) {
  //   let insight = adInsights[i]!;

  //   // const insightExists = await db.query.metaInsightData.
  // }
};
