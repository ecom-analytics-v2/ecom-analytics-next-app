"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appRunningEmbedded } from "@/lib/integrations/shopify-client";
import { api } from "@/trpc/react";
import { GetConnectionStatusSchema } from "@/types/api/connections-router";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const Page = () => {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col">
        <div className="text-xl">Settings</div>
        <div className="text-gray-400">Manage your team's account connections</div>
      </div>
      <div className="flex flex-col gap-4">
        <AccountConnection
          identifier="shopify"
          name={"Shopify"}
          description={
            "Incididunt exercitation excepteur consectetur irure minim ut do veniam. Excepteur deserunt ad in amet aliqua nostrud voluptate non duis proident est adipisicing sit anim. Adipisicing mollit cillum anim consectetur."
          }
          logo={
            <div className="bg-white rounded-lg p-4">
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
            <div className="bg-white rounded-lg p-4">
              <img src="/img/meta-logo.svg" width={80} />
            </div>
          }
        />
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
  const isEmbedded = appRunningEmbedded();
  const status = api.connectionsRouter.getConnectionStatus.useQuery({
    connection: identifier,
  });

  return (
    <div className="flex justify-between gap-6 border border-border rounded-lg h-40 items-center px-12">
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
          {identifier === "meta" ? (
            <Link href={status.data.connect_url!}>
              <Button>Connect</Button>
            </Link>
          ) : (
            <ShopifyAccountConnection />
          )}
        </>
      )}
      {status.isLoading && <Button disabled>Connect</Button>}
    </div>
  );
};

const ShopifyAccountConnection = () => {
  const router = useRouter();
  const connectShopify = api.connectionsRouter.connectShopify.useMutation();

  const [shopifyShop, setShopifyShop] = useState<string>("");

  const submit = async () => {
    const result = await connectShopify.mutateAsync({ shopify_shop: shopifyShop });
    if (result.redirect_uri) router.push(result.redirect_uri);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 min-w-[250px]">
        <Label>Shop Domain</Label>
        <Input
          placeholder="my-shop-here.myshopify.com"
          defaultValue={shopifyShop}
          onChange={(e) => setShopifyShop(e.currentTarget.value)}
        />
      </div>
      <Button onClick={() => submit()}>Connect</Button>
    </div>
  );
};
