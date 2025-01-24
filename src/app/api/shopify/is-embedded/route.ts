// because you cannot access URL query parameters of a current iFrame,
// from within an iFrame, this endpoint is needed to tell the
// client whether it is being rendered from within an
// embedded Shopify app or not

import { NextRequest, NextResponse } from "next/server";

export const GET = (req: NextRequest) => {
  console.log(req.nextUrl.toString());
  const requestEmbedded = req.nextUrl.searchParams.get("embedded") === "1";
  const requestHasHmac = req.nextUrl.searchParams.get("hmac");

  const isEmbedded =
    requestEmbedded && requestHasHmac !== undefined && typeof requestHasHmac === "string";

  return NextResponse.json(isEmbedded);
};
