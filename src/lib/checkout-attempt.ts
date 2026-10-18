import type { CreateOrderInput, CreateOrderResult } from "./api/bitrix";
import { securePost } from "./api/security";

export const ATTEMPT_STORAGE_KEY = "optika-checkout-attempt-v1";
export type CheckoutAttempt = { id: string; input: CreateOrderInput; createdAt: number };

export function readAttempt(): CheckoutAttempt | null {
  const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
  if (!raw) return null;
  const value = JSON.parse(raw) as CheckoutAttempt;
  if (!value.id || !Array.isArray(value.input?.lines)) throw new Error("Не удалось прочитать попытку заказа. Обратитесь в салон.");
  return value;
}

export function saveAttempt(input: CreateOrderInput): CheckoutAttempt {
  const existing = readAttempt();
  if (existing) return existing;
  const attempt = { id: crypto.randomUUID().replace(/-/g, ""), input, createdAt: Date.now() };
  localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(attempt));
  return attempt;
}

export function forgetAttempt(id: string) {
  if (readAttempt()?.id === id) localStorage.removeItem(ATTEMPT_STORAGE_KEY);
}

export type AttemptStatus = { status: "not_found" | "validating" | "saving" | "processing" | "complete" | "cancelled"; result?: CreateOrderResult };
export function checkAttempt(id: string): Promise<AttemptStatus> {
  return securePost("order_attempt.php", { attemptId: id });
}

export async function cancelAttempt(id: string): Promise<void> {
  const result = await securePost<AttemptStatus>("order_attempt.php", { attemptId: id, action: "cancel" });
  if (result.status !== "cancelled") throw new Error("Заказ уже обрабатывается; сначала проверьте результат.");
}

export async function withCheckoutLock<T>(action: () => Promise<T>): Promise<T> {
  if (!navigator.locks) throw new Error("Для безопасного оформления обновите браузер или обратитесь в салон.");
  return navigator.locks.request("optika-checkout", action);
}

export function orderFingerprint(input: CreateOrderInput): string {
  const { quoteId: _quote, acceptPendingDelivery: _pending, ...body } = input;
  return JSON.stringify(body);
}
