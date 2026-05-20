import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Eye, Target, Telescope } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { tiers, transactions, mockAccount } from "@/data/loyalty";

export const Route = createFileRoute("/loyalty")({
  head: () => ({ meta: [{ title: "Программа лояльности — ОПТИКА 100%" }] }),
  component: LoyaltyPage,
});

const TIER_ICONS = [Eye, Target, Telescope];

function LoyaltyHero() {
  const account = mockAccount;
  const currentTier = tiers.find((t) => t.id === account.tierId)!;
  const progress = Math.min(100, (account.points / account.nextTierPoints) * 100);

  return (
    <div className="relative rounded-2xl overflow-hidden p-8 grid md:grid-cols-[1.4fr_1fr] gap-8 text-[oklch(0.96_0.005_80)]"
      style={{ background: "linear-gradient(135deg, oklch(0.22 0.014 250) 0%, oklch(0.18 0.012 250) 100%)" }}>
      {/* glow */}
      <div className="absolute -right-28 -top-28 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.18 28 / 0.25) 0%, transparent 70%)" }} />

      <div>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-60 mb-2.5">
          Программа лояльности
        </div>
        <h1 className="font-serif text-[40px] font-normal leading-[1.05] tracking-[-0.01em] m-0 text-[oklch(0.96_0.005_80)] flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand shrink-0">
            <Eye className="h-4 w-4" />
          </span>
          {currentTier.name}
        </h1>
        <p className="text-[14px] opacity-70 mt-4">
          Здравствуйте, {account.name}! Ваши баллы действуют до {account.pointsExpireAt}.
        </p>

        <div className="mt-6 p-[18px_22px] rounded-xl border flex items-baseline justify-between"
          style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] opacity-60 mb-1">
              Баллов на счёте
            </div>
            <div className="font-serif text-[36px] font-normal leading-none">
              {account.points.toLocaleString("ru")}
              <span className="font-mono text-[14px] opacity-60 ml-1">б</span>
            </div>
          </div>
          <div className="text-[12px] opacity-55 text-right max-w-[24ch] leading-snug">
            1 балл = 1 ₽<br />до 30% от суммы заказа
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between font-mono text-[11px] opacity-70 mb-2">
            <span>{account.points.toLocaleString("ru")} б</span>
            <span>до Чёткости: {(account.nextTierPoints - account.points).toLocaleString("ru")} б</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, oklch(0.55 0.18 28), oklch(0.7 0.18 28))" }}
            />
          </div>
          <p className="text-[12.5px] opacity-65 mt-2.5">
            Ещё {(account.nextTierPoints - account.points).toLocaleString("ru")} ₽ покупок до статуса Чёткость (8% кешбэк)
          </p>
        </div>
      </div>

      {/* QR card */}
      <div className="bg-[oklch(0.985_0.004_80)] text-[oklch(0.18_0.01_250)] rounded-2xl p-6 grid gap-4 content-start">
        <div>
          <h5 className="font-serif text-[18px] font-medium m-0">Карта участника</h5>
          <p className="text-[12.5px] text-muted-foreground m-0 mt-1 leading-snug">
            Предъявите QR-код на кассе, чтобы начислить баллы.
          </p>
        </div>
        {/* QR placeholder */}
        <div className="aspect-square max-w-[160px] mx-auto rounded-lg bg-[repeating-conic-gradient(oklch(0.18_0.01_250)_0deg_90deg,transparent_90deg_180deg)] bg-[length:16px_16px] opacity-80" />
        <div className="font-mono text-[12px] text-center tracking-[0.1em] py-2 px-3 bg-surface rounded-lg">
          {account.cardNumber}
        </div>
      </div>
    </div>
  );
}

function TierLadder() {
  const account = mockAccount;
  return (
    <div>
      <h2 className="font-serif text-[28px] font-normal mb-6">Уровни программы</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((tier, i) => {
          const Icon = TIER_ICONS[i];
          const isActive = tier.id === account.tierId;
          const isLocked = tiers.indexOf(tier) > tiers.findIndex((t) => t.id === account.tierId);
          return (
            <div
              key={tier.id}
              className={cn(
                "bg-card border rounded-2xl p-6 grid gap-3",
                isActive && "border-ink bg-cream",
                isLocked && "opacity-60",
                !isActive && !isLocked && "border-border",
              )}
            >
              <div className="flex justify-between items-baseline">
                <div className="font-serif text-[22px] font-medium tracking-[-0.01em] flex items-center gap-2">
                  <Icon className="h-4 w-4 text-brand" />
                  {tier.name}
                </div>
                <div className="font-mono text-[12px] text-muted-foreground">
                  от {tier.threshold.toLocaleString("ru")} ₽
                </div>
              </div>
              <div className="font-serif text-[36px] font-normal leading-none text-ink">
                {tier.cashback}%
              </div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
                кешбэк
              </div>
              <ul className="m-0 p-0 list-none grid gap-2">
                {tier.benefits.map((b) => (
                  <li key={b} className="text-[13px] flex gap-2 items-start">
                    <Check className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isLocked ? "text-muted-foreground" : "text-brand")} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoyaltyRedemption() {
  const [value, setValue] = useState([45]);
  const maxPoints = mockAccount.points;
  const used = Math.round((value[0] / 100) * maxPoints);
  const savings = used;

  return (
    <div className="bg-cream border border-border rounded-2xl p-6">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="font-serif text-[18px] font-medium">Списать баллы</h3>
        <span className="font-mono text-[12px] text-muted-foreground">
          доступно: {maxPoints.toLocaleString("ru")} б
        </span>
      </div>
      <p className="text-[12.5px] text-muted-foreground mb-4">
        Выберите сколько баллов использовать при следующей покупке.
      </p>
      <div className="py-6">
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between font-mono text-[10.5px] text-muted-foreground mt-2">
          <span>0 б</span>
          <span>{maxPoints.toLocaleString("ru")} б</span>
        </div>
      </div>
      <div className="flex justify-between border-t border-border pt-4 font-mono text-[13px]">
        <span>Вы экономите</span>
        <span className="text-brand font-semibold">−{savings.toLocaleString("ru")} ₽</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Совершите покупку", desc: "Любой заказ на сайте или в салоне начисляет баллы автоматически." },
    { n: "02", title: "Получите баллы", desc: "1 ₽ потраченных = 1 балл (или больше с более высоким статусом)." },
    { n: "03", title: "Применяйте на кассе", desc: "При оформлении заказа выберите нужное число баллов для оплаты." },
    { n: "04", title: "Растите в статусе", desc: "Чем больше покупок — тем выше кешбэк и больше привилегий." },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl p-6 grid gap-3.5">
      <h3 className="font-serif text-[18px] font-medium">Как это работает</h3>
      {steps.map((s) => (
        <div key={s.n} className="flex gap-4 items-start">
          <span className="font-mono text-[13px] text-brand shrink-0 w-6">{s.n}</span>
          <div>
            <div className="text-[14px] font-medium">{s.title}</div>
            <div className="text-[12.5px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PointsHistory() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-serif text-[20px] font-medium mb-4">История баллов</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Дата", "Операция", "Тип", "Баллы"].map((h) => (
                <th key={h} className="text-left py-3 border-b border-border font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="py-3 font-mono text-[12px] text-muted-foreground">{tx.date}</td>
                <td className="py-3">{tx.description}</td>
                <td className="py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 font-mono text-[10.5px] px-2 py-0.5 rounded-full uppercase tracking-[0.08em]",
                    tx.type === "earn" && "bg-[oklch(0.94_0.05_150/0.6)] text-[oklch(0.35_0.12_150)]",
                    tx.type === "spend" && "bg-brand-50 text-brand-700",
                    tx.type === "expire" && "bg-surface text-muted-foreground",
                  )}>
                    {tx.type === "earn" && "+ начислено"}
                    {tx.type === "spend" && "− списано"}
                    {tx.type === "expire" && "∅ сгорели"}
                  </span>
                </td>
                <td className={cn(
                  "py-3 font-mono text-right font-semibold",
                  tx.type === "earn" && "text-[oklch(0.45_0.15_150)]",
                  tx.type === "spend" && "text-brand",
                  tx.type === "expire" && "text-muted-foreground",
                )}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoyaltyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-12 space-y-10">
      <LoyaltyHero />
      <TierLadder />
      <div className="grid md:grid-cols-2 gap-6">
        <LoyaltyRedemption />
        <HowItWorks />
      </div>
      <PointsHistory />
    </div>
  );
}
