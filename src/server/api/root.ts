// import ConnectionsRouter from "./routers/connections";
import ConnectionsRouter from "./routers/connections";
import FiltersRouter from "./routers/filters";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  // connectionsRouter: ConnectionsRouter,
  filtersRouter: FiltersRouter,
  connectionsRouter: ConnectionsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
