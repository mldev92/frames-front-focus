export const IS_PRIVATE_BETA = import.meta.env.VITE_PRIVATE_BETA === "true";

export function authUrl() {
  return IS_PRIVATE_BETA ? "https://optika100.com/auth/" : "/auth/";
}
