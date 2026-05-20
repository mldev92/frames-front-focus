export interface Tier {
  id: string;
  name: string;
  cashback: number;
  threshold: number;
  benefits: string[];
}

export interface LoyaltyTransaction {
  id: string;
  date: string;
  description: string;
  type: "earn" | "spend" | "expire";
  points: number;
}

export interface LoyaltyAccount {
  name: string;
  tierId: string;
  points: number;
  pointsExpireAt: string;
  cardNumber: string;
  nextTierPoints: number;
}

export const tiers: Tier[] = [
  {
    id: "zerenie",
    name: "Зрение",
    cashback: 5,
    threshold: 0,
    benefits: ["5% кешбэк с каждой покупки", "Бесплатная доставка от 3 000 ₽", "Ранний доступ к новинкам"],
  },
  {
    id: "chetkost",
    name: "Чёткость",
    cashback: 8,
    threshold: 15000,
    benefits: ["8% кешбэк с каждой покупки", "Бесплатная доставка от 1 500 ₽", "Приоритетная запись к врачу", "−10% на услуги клиники"],
  },
  {
    id: "dalnovidnost",
    name: "Дальновидность",
    cashback: 10,
    threshold: 40000,
    benefits: ["10% кешбэк с каждой покупки", "Бесплатная доставка всегда", "VIP-запись к специалисту", "−20% на услуги клиники", "Персональный стилист-оптик"],
  },
];

export const mockAccount: LoyaltyAccount = {
  name: "Анна",
  tierId: "zerenie",
  points: 3060,
  pointsExpireAt: "2026-03-01",
  cardNumber: "1000 0042 8817 3391",
  nextTierPoints: 15000,
};

export const transactions: LoyaltyTransaction[] = [
  { id: "t1", date: "16.05.2025", description: "Оправа Silhouette Titan 5544", type: "earn", points: 892 },
  { id: "t2", date: "02.04.2025", description: "Линзы Acuvue Oasys (3 уп.)", type: "earn", points: 450 },
  { id: "t3", date: "15.03.2025", description: "Оплата баллами при заказе", type: "spend", points: -500 },
  { id: "t4", date: "01.02.2025", description: "Диагностика зрения", type: "earn", points: 200 },
  { id: "t5", date: "10.01.2025", description: "Истечение срока действия", type: "expire", points: -82 },
  { id: "t6", date: "18.12.2024", description: "Оправа Ray-Ban RB5228", type: "earn", points: 690 },
];
