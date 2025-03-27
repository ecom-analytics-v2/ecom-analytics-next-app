import { env } from "@/env";
import { DualLinechartData, StandardLinechartData } from "@/types/chartTypes";
import { shopifyAccounts, Team } from "../db/schema";

type BackendRoute =
  | "/charts/revenue-charts"
  | "/initial-sync/shopify-account"
  | "/meta/sync/ad-insights";
type BackendMethod = "GET" | "POST";
type BackendBody = object;
type BackendQueryParams = string;

interface StandardBackendSuccessResponse {
  success: true;
  message: string;
}
interface StandardBackendErrorResponse {
  success: false;
  error: string;
}

export const makeBackendRequest = async <T>(
  route: BackendRoute,
  method: BackendMethod,
  body?: BackendBody,
  queryParams?: BackendQueryParams
): Promise<T | StandardBackendErrorResponse> => {
  if (method === "POST" && !body) throw new Error("Must provide 'body' for method 'POST'");

  try {
    if (env.NODE_ENV === "development")
      console.log(
        `Making API Request: ${`${env.BACKEND_BASE_URL}/api/v1${route}${queryParams ? `?${queryParams}` : ""}`}`
      );

    const response = await fetch(
      `${env.BACKEND_BASE_URL}/api/v1${route}${queryParams ? `?${queryParams}` : ""}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );
    if (!response.ok) {
      const data: StandardBackendErrorResponse = await response.json();
      return data;
    }

    const data: T = await response.json();

    return data;
  } catch (e) {
    throw new Error(`Failed to fetch from API: ${e}`);
  }
};

export const triggerInitialShopifySync = async (
  shopifyAccount: typeof shopifyAccounts.$inferSelect
): Promise<boolean> => {
  const response = await makeBackendRequest<StandardBackendSuccessResponse>(
    "/initial-sync/shopify-account",
    "POST",
    {
      shopify_account_id: shopifyAccount.id,
    }
  );

  return response.success;
};
interface RevenueCharts {
  RpvVsProfitLine: DualLinechartData;

  RevenuePerVisitor: StandardLinechartData;
  ProfitLine: StandardLinechartData;

  AverageOrderValue: StandardLinechartData;
  AverageCustomerPurchaseFrequency: StandardLinechartData;
  FirstPurchaseConversionRate: StandardLinechartData;
}

interface RevenueChartsResponse {
  success: boolean;
  revenueCharts: RevenueCharts;
}

export const fetchRevenueCharts = async (team: Team, startDate?: Date, endDate?: Date) => {
  const response = await makeBackendRequest<RevenueChartsResponse>(
    "/charts/revenue-charts",
    "GET",
    undefined,
    `team_id=${team.id}${startDate && endDate ? `&start_date=${backendDate(startDate)}&end_date=${backendDate(endDate)}` : ""}`
  );

  if (!response.success) {
    const errResponse = response as StandardBackendErrorResponse;
    throw new Error(`Error fetching Revenue Charts from API: ${errResponse.error}`);
  }

  return response.revenueCharts;
};

export const backendDate = (date: Date) => date.toISOString().split("T")[0];
