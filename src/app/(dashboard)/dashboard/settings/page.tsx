"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { GetConnectionStatusSchema } from "@/types/api/connections-router";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
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
  const status = api.connectionsRouter.getConnectionStatus.useQuery({ connection: identifier });

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
        <Link href={status.data.connect_url!}>
          <Button>Connect</Button>
        </Link>
      )}
      {status.isLoading && <Button disabled>Connect</Button>}
    </div>
  );
};
