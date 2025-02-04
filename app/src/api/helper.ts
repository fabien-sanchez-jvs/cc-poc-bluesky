/**
 * format une URL pour l'API
 */
export const getUrl = (path: string, query: string = "") => {
  return `http://localhost:3000/${path}${query ? `?${query}` : ""}`;
};
