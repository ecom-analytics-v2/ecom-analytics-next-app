"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const BillingManage = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const getPortalSessionQuery = api.billingRouter.getStripeBillingPortalSession.useQuery(
    undefined,
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (getPortalSessionQuery.data) {
      const { url } = getPortalSessionQuery.data;
      if (url) {
        window.location.href = url;
      }
    }
  }, [getPortalSessionQuery.data]);

  return (
    <Card className="w-full md:w-[500px]">
      <CardHeader>
        <CardTitle>Manage Subscription</CardTitle>
        <CardDescription>
          Update your payment method, view billing history, or change your subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => getPortalSessionQuery.refetch()}
          disabled={getPortalSessionQuery.isLoading || isRedirecting}
          className="w-full"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BillingManage;
