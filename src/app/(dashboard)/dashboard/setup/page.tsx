"use client";

import SetupRequirements from "@/components/dashboard/setup/initial";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div>
      <SetupRequirements nextStep={() => router.push("/dashboard/settings")} />
    </div>
  );
};

export default Page;
