"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { ConnectShopifySchema, GetConnectionStatusSchema } from "@/types/api/connections-router";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const Page = () => {
  return (
    <div className="bg-muted/40 p-4">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col">
          <div className="text-xl">Settings</div>
          <div className="text-gray-400">Manage your team's account connections</div>
        </div>
        <div className="flex flex-col gap-4">
          <AccountConnection
            identifier="shopify"
            name={"Shopify"}
            description={"Custom Client for Shopify MUST have scopes: read_orders,read_products"}
            logo={
              <div className="bg-white rounded-[8px] p-4">
                <img src="/img/shopify-logo.svg" width={80} />
              </div>
            }
          />
          <AccountConnection
            identifier="meta"
            name={"Meta Ads"}
            description={
              "Incididunt exercitation excepteur consectetur irure minim ut do veniam. Excepteur deserunt ad in amet aliqua nostrud voluptate non duis proident est adipisicing sit anim. Adipisicing mollit cillum anim consectetur."
            }
            logo={
              <div className="bg-white rounded-[8px] p-4">
                <img src="/img/meta-logo.svg" width={80} />
              </div>
            }
          />
          <AccountConnection
            identifier="google"
            name={"Google Ads"}
            description={
              "Incididunt exercitation excepteur consectetur irure minim ut do veniam. Excepteur deserunt ad in amet aliqua nostrud voluptate non duis proident est adipisicing sit anim. Adipisicing mollit cillum anim consectetur."
            }
            logo={
              <div className="bg-white rounded-[8px] p-4">
                <img src="/img/google-logo.svg" width={80} />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Page;

const AccountConnection = ({
  identifier,
  logo,
  name,
  description,
}: {
  identifier: z.infer<typeof GetConnectionStatusSchema>["connection"];
  logo: React.ReactNode;
  name: string;
  description: string;
}) => {
  const status = api.connectionsRouter.getConnectionStatus.useQuery({
    connection: identifier,
  });

  return (
    <Card className="h-fit">
      <CardContent className="flex justify-between gap-6 items-center py-6">
        <div className="flex gap-12 items-center">
          {logo}
          <div className="flex flex-col gap-2 max-w-lg">
            <div className="text-lg">{name}</div>
            <div className="text-gray-400 text-sm">{description}</div>
          </div>
        </div>
        {status.data?.state === "account_connected" && (
          <div className="flex flex-col gap-3 text-center text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckIcon width={20} />
              Account Connected
            </div>
            <Button variant="outline" disabled>
              {status.data.account_details?.name}
            </Button>
          </div>
        )}
        {status.data?.state === "no_account" && (
          <>
            {identifier === "meta" || identifier == "google" ? (
              <Link href={status.data.connect_url!}>
                <Button>Connect</Button>
              </Link>
            ) : (
              <ShopifyAccountConnection refresh={() => status.refetch()} />
            )}
          </>
        )}
        {status.isLoading && <Button disabled>Connect</Button>}
      </CardContent>
    </Card>
  );
};

const ShopifyAccountConnection = ({ refresh }: { refresh: () => void }) => {
  const router = useRouter();
  const connectShopify = api.connectionsRouter.connectShopify.useMutation();

  type FormType = z.infer<typeof ConnectShopifySchema>;

  const [shopifyShop, setShopifyShop] = useState<string>("");
  const [connectionType, setConnectionType] =
    useState<FormType["connection_type"]>("official_client");

  const [ccClientId, setCcClientId] = useState<string>("");
  const [ccClientSecret, setCcClientSecret] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");

  const submit = async () => {
    const result = await connectShopify.mutateAsync({
      shopify_shop: shopifyShop,
      connection_type: connectionType,
      custom_client:
        connectionType === "custom_client"
          ? {
              client_id: ccClientId,
              client_secret: ccClientSecret,
              access_token: accessToken,
            }
          : undefined,
    });
    if (result.redirect_uri) router.push(result.redirect_uri);
    if (result.complete && result.shopify_account_id) {
      setTimeout(() => {
        refresh();
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 min-w-[250px]">
        <Label>Connection Client</Label>
        <Tabs
          defaultValue={connectionType}
          onValueChange={(value) => setConnectionType(value as FormType["connection_type"])}
        >
          <TabsList>
            <TabsTrigger value="official_client">Official</TabsTrigger>
            <TabsTrigger value="custom_client">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {connectionType === "custom_client" && (
        <div className="flex flex-col gap-4 min-w-[250px] border-border border-t border-b py-4">
          <div className="flex flex-col gap-2 min-w-[250px]">
            <Label>Client ID / API Key</Label>
            <Input
              defaultValue={ccClientId}
              onChange={(e) => setCcClientId(e.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[250px]">
            <Label>Client Secret / API Key Secret</Label>
            <Input
              defaultValue={ccClientSecret}
              onChange={(e) => setCcClientSecret(e.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[250px]">
            <Label>Access Token</Label>
            <Input
              defaultValue={accessToken}
              onChange={(e) => setAccessToken(e.currentTarget.value)}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 min-w-[250px]">
        <Label>Shop Domain</Label>
        <Input
          placeholder="my-shop-here.myshopify.com"
          defaultValue={shopifyShop}
          onChange={(e) => setShopifyShop(e.currentTarget.value)}
        />
      </div>
      <Button
        onClick={() => submit()}
        disabled={connectShopify.isPending || connectShopify.isSuccess}
      >
        Connect
      </Button>
    </div>
  );
};
