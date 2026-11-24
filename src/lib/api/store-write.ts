import { getCsrfToken } from "./security.ts";

let csrfRecovery: Promise<string> | undefined;

export async function withStoreWrite<T>(write: () => Promise<T>): Promise<T> {
  try {
    await getCsrfToken();
  } catch {
    // После сетевой ошибки обновляем токен; запрос с данными отправляется один раз.
    csrfRecovery ??= getCsrfToken(true).finally(() => { csrfRecovery = undefined; });
    await csrfRecovery;
  }
  return write();
}
