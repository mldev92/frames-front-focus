import assert from "node:assert/strict";
import test from "node:test";
import { formatPhone, isPhoneComplete, phoneLocalDigits } from "../../src/lib/checkout-phone.ts";

test("formats progressively and keeps +7", () => {
  assert.equal(formatPhone(""), "");
  assert.equal(formatPhone("9"), "+7 (9");
  assert.equal(formatPhone("916"), "+7 (916");
  assert.equal(formatPhone("9161"), "+7 (916) 1");
  assert.equal(formatPhone("9161234"), "+7 (916) 123-4");
  assert.equal(formatPhone("9161234567"), "+7 (916) 123-45-67");
});

test("leading 8, 7 and +7 are the country code, not part of the number", () => {
  assert.equal(formatPhone("89161234567"), "+7 (916) 123-45-67");
  assert.equal(formatPhone("79161234567"), "+7 (916) 123-45-67");
  assert.equal(formatPhone("+7 (916) 123-45-67"), "+7 (916) 123-45-67");
  assert.equal(formatPhone("8"), "+7");
});

test("+7 cannot be deleted by backspace, only by clearing the field", () => {
  assert.equal(formatPhone("+"), "+7");
  assert.equal(formatPhone("+7 ("), "+7");
  assert.equal(formatPhone("+7 (916)"), "+7 (916");
  assert.equal(formatPhone("+7 (916"), "+7 (916");
  assert.equal(formatPhone(""), "");
});

test("completeness needs exactly ten local digits, extra digits are cut", () => {
  assert.equal(isPhoneComplete("+7 (916) 123-45-67"), true);
  assert.equal(isPhoneComplete("+7 (916) 123-45-6"), false);
  assert.equal(phoneLocalDigits("+7 (916) 123-45-67 99"), "9161234567");
  assert.equal(formatPhone("+7 (916) 123-45-67 99"), "+7 (916) 123-45-67");
});

test("an 800 number typed after the prefix keeps its 8", () => {
  assert.equal(formatPhone("+7 (800"), "+7 (800");
  assert.equal(formatPhone("88005553535"), "+7 (800) 555-35-35");
});

test("typing the habitual 8 into the already prefilled +7 does not become a digit", () => {
  let value = "+7";
  for (const char of "89161234567") value = formatPhone(value + char);
  assert.equal(value, "+7 (916) 123-45-67");
});
