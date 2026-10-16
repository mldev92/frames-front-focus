export const IS_PRIVATE_BETA = import.meta.env.VITE_PRIVATE_BETA === "true";

// Включать только после проверки моделей и камеры; по умолчанию примерочная скрыта.
export const VIRTUAL_TRY_ON_ENABLED = import.meta.env.VITE_VIRTUAL_TRY_ON === "true";

export function authUrl() {
  return IS_PRIVATE_BETA ? "https://optika100.com/auth/" : "/auth/";
}
