// import ConnectionsRouter from "./routers/connections";
import ConnectionsRouter from "./routers/connections";
import FilterRouter from "./routers/filters";
import ShopifyRouter from "./routers/shopify";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  filterRouter: FilterRouter,
  connectionsRouter: ConnectionsRouter,
  shopifyRouter: ShopifyRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
