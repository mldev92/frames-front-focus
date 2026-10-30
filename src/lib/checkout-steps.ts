/** Последовательные шаги оформления заказа: у каждого есть «Далее»/«Назад». */

export const CHECKOUT_STEPS = ["region", "delivery", "payment", "buyer", "items"] as const;
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

/** Шаги верхнего индикатора (3 полоски) и какому из них принадлежит каждый раздел. */
export const PROGRESS_LABELS = ["Доставка", "Оплата", "Подтверждение"] as const;
export const PROGRESS_INDEX: Record<CheckoutStep, number> = {
  region: 0,
  delivery: 0,
  payment: 1,
  buyer: 2,
  items: 2,
};

export interface StepState {
  hasLocation: boolean;
  hasDelivery: boolean;
  deliveryLoading: boolean;
  deliveryRequiresPickupPoint: boolean;
  deliveryRequiresAddress: boolean;
  hasPickupPoint: boolean;
  address: string;
  hasPayment: boolean;
  fullName: string;
  email: string;
  phoneComplete: boolean;
  hasLines: boolean;
}

/** Почему нельзя перейти дальше с этого шага; null — можно. */
export function stepProblem(step: CheckoutStep, state: StepState): string | null {
  switch (step) {
    case "region":
      return state.hasLocation ? null : "Выберите город из списка";
    case "delivery":
      if (!state.hasDelivery) return state.deliveryLoading ? "Считаем стоимость доставки…" : "Выберите способ доставки";
      if (state.deliveryLoading) return "Считаем стоимость доставки…";
      if (state.deliveryRequiresPickupPoint && !state.hasPickupPoint) return "Выберите пункт самовывоза СДЭК";
      if (state.deliveryRequiresAddress && !state.address.trim()) return "Укажите адрес доставки";
      return null;
    case "payment":
      return state.hasPayment ? null : "Выберите способ оплаты";
    case "buyer":
      if (!state.fullName.trim()) return "Укажите Ф.И.О.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) return "Укажите корректный e-mail";
      if (!state.phoneComplete) return "Укажите телефон полностью";
      return null;
    case "items":
      return state.hasLines ? null : "Корзина пуста";
  }
}

/** Первый шаг, который не пройден, — туда возвращаем покупателя при отправке заказа. */
export function firstProblemStep(state: StepState): CheckoutStep | null {
  return CHECKOUT_STEPS.find((step) => stepProblem(step, state) !== null) ?? null;
}
