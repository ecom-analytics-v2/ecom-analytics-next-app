export const appRunningEmbedded = () => {
  return typeof window !== "undefined" && window.self !== window.top;
};
