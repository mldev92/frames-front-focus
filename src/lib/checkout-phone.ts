/**
 * Маска телефона оформления заказа: «+7» не исчезает и не стирается, как в старой форме
 * (inputmask «+7 (___) ___-__-__»). Хранится и отправляется уже отформатированная строка.
 */

const LOCAL_LENGTH = 10;

/** Десять цифр номера без кода страны: «8…», «+7…» и «7…» отбрасывают ведущую цифру. */
export function phoneLocalDigits(raw: string): string {
  const trimmed = raw.trim();
  // Поле уже содержит «+7», и покупатель по привычке печатает «8» (или «7») первой цифрой.
  if (/^\+7[78]$/.test(trimmed)) return "";
  let digits = trimmed.replace(/\D/g, "");
  if (digits && (trimmed.startsWith("+7") || digits[0] === "7" || digits[0] === "8")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, LOCAL_LENGTH);
}

export function formatPhone(raw: string): string {
  const local = phoneLocalDigits(raw);
  if (!local) return raw.trim() ? "+7" : "";
  let out = `+7 (${local.slice(0, 3)}`;
  if (local.length > 3) out += `) ${local.slice(3, 6)}`;
  if (local.length > 6) out += `-${local.slice(6, 8)}`;
  if (local.length > 8) out += `-${local.slice(8, 10)}`;
  return out;
}

export function isPhoneComplete(value: string): boolean {
  return phoneLocalDigits(value).length === LOCAL_LENGTH;
}
