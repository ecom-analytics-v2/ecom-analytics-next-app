import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Increase stale time to reduce refetching
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Add caching duration
        gcTime: 10 * 60 * 1000, // 10 minutes
        // Add retry configuration
        retry: 1,
        retryDelay: 3000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
