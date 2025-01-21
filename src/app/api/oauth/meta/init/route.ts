import { initMetaOAuth } from "@/lib/integrations/meta";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return redirect(initMetaOAuth());
};
