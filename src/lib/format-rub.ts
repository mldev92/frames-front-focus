/** Неразрывный пробел: разряды и знак рубля не должны переноситься. */
const NBSP = String.fromCharCode(160);

/** Например: 1 000 ₽ */
export const formatRub = (value: number) =>
  `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}${NBSP}₽`;
