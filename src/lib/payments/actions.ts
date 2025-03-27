"use server";

import { withTeam } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { createCheckoutSession } from "./stripe";

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get("priceId") as string;
  await createCheckoutSession({ team: team, priceId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  redirect("/");
});
