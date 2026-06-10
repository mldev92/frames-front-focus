import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  ChevronDown,
  MapPin,
  Truck,
  CreditCard,
  User,
  ShoppingCart,
  Search,
  Shield,
  Phone,
  Tag,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useCart, formatPrice } from "@/lib/store/cart";
import { useIsMobile } from "@/hooks/use-mobile";
import { IS_PRIVATE_BETA } from "@/lib/runtime";
import { CONTACT } from "@/data/contact";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Оформление заказа · ОПТИКА 100%" },
      { name: "description", content: "Оформите доставку и оплату вашего заказа." },
    ],
  }),
  component: Checkout,
});

const CITIES = ["Москва", "Санкт-Петербург", "Кемерово", "Новокузнецк"];

const DELIVERY_OPTIONS = [
  { label: "Самовывоз из салона", sub: "«Оптика 100%» · ул. Кирочная, 17, Санкт-Петербург (м. Чернышевская)", price: "Бесплатно", free: true },
  { label: "Курьер по СПб", sub: "Доставка в течение 1-2 дней", price: "от 350 ₽", free: false },
  { label: "Почта России / СДЭК", sub: "5-10 рабочих дней", price: "по тарифу", free: false },
];

const PAYMENT_OPTIONS = [
  { label: "Наличными или по карте при выдаче", sub: "Оплата в момент получения товара в салоне." },
  { label: "Т-Рассрочка", sub: "Рассрочка от Т-Банка — без переплат, до 12 месяцев." },
];

function Checkout() {
  const isMobile = useIsMobile();
  const { totals, lines, setQty, clear } = useCart();
  const { subtotal } = totals();

  const [open, setOpen] = useState<string | null>("region");
  const [city, setCity] = useState("Санкт-Петербург");
  const [citySearch, setCitySearch] = useState("");
  const [delivery, setDelivery] = useState("Самовывоз из салона");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Наличными или по карте при выдаче");
  const [promoVisible, setPromoVisible] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [comment, setComment] = useState("");

  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));
  const isFree = delivery === "Самовывоз из салона";

  const submit = () => {
    if (IS_PRIVATE_BETA) {
      toast.info("Оформление заказа недоступно в бета-версии", {
        description: "Корзина сохранена. Заказ не создан и данные никуда не отправлены.",
      });
      return;
    }
    if (!agreed) {
      toast.error("Необходимо согласиться с условиями");
      return;
    }
    toast.success("Заказ оформлен! Мы свяжемся с вами в течение 30 минут.");
    clear();
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: isMobile ? "24px 16px" : "40px 32px",
      }}
    >
      <h1
        className="font-serif"
        style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, marginBottom: "28px" }}
      >
        Оформление заказа
      </h1>

      <ProgressSteps />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 380px",
          gap: isMobile ? "32px" : "48px",
          alignItems: "start",
        }}
      >
        {/* Left — accordion sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          <SectionCard
            id="region"
            icon={<MapPin size={18} />}
            title="Регион доставки"
            subtitle={city}
            isOpen={open === "region"}
            onToggle={() => toggle("region")}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {CITIES.map((c) => (
                <CityChip key={c} label={c} selected={city === c} onClick={() => setCity(c)} />
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-foreground)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Поиск города..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full bg-background border border-border"
                style={{ borderRadius: "8px", padding: "10px 12px 10px 36px", fontSize: "15px", outline: "none" }}
              />
            </div>
          </SectionCard>

          <SectionCard
            id="delivery"
            icon={<Truck size={18} />}
            title="Доставка"
            subtitle={delivery}
            isOpen={open === "delivery"}
            onToggle={() => toggle("delivery")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {DELIVERY_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.label}
                  label={opt.label}
                  sub={opt.sub}
                  badge={opt.price}
                  badgeFree={opt.free}
                  selected={delivery === opt.label}
                  onClick={() => setDelivery(opt.label)}
                />
              ))}
            </div>
            {delivery === "Курьер по СПб" && (
              <div style={{ marginTop: "16px" }}>
                <Field
                  label="Адрес доставки"
                  placeholder="Улица, дом, квартира"
                  value={address}
                  onChange={setAddress}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard
            id="payment"
            icon={<CreditCard size={18} />}
            title="Оплата"
            subtitle={payment}
            isOpen={open === "payment"}
            onToggle={() => toggle("payment")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PAYMENT_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.label}
                  label={opt.label}
                  sub={opt.sub}
                  selected={payment === opt.label}
                  onClick={() => setPayment(opt.label)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            id="buyer"
            icon={<User size={18} />}
            title="Покупатель"
            subtitle="Контактные данные"
            isOpen={open === "buyer"}
            onToggle={() => toggle("buyer")}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field label="Имя" placeholder="Иван" required />
              <Field label="Фамилия" placeholder="Иванов" required />
            </div>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Field label="Телефон" type="tel" placeholder="+7 (___) ___-__-__" required />
              <Field label="E-mail" type="email" placeholder="example@mail.ru" required />
            </div>
          </SectionCard>

          <SectionCard
            id="items"
            icon={<ShoppingCart size={18} />}
            title="Товары в заказе"
            subtitle={lines.length > 0 ? `${lines.length} товар(а)` : "Корзина пуста"}
            isOpen={open === "items"}
            onToggle={() => toggle("items")}
          >
            {lines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Корзина пуста.{" "}
                <Link to="/catalog_s/$category" params={{ category: "opravy" }} className="text-brand">
                  В каталог
                </Link>
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {lines.map((line) => (
                  <div
                    key={line.slug + (line.color ?? "") + (line.lensLabel ?? "")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      backgroundColor: "var(--surface)",
                      borderRadius: "10px",
                    }}
                  >
                    {line.image ? (
                      <img
                        src={line.image}
                        alt={line.name}
                        referrerPolicy="no-referrer"
                        style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "6px",
                          backgroundColor: "var(--border)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>{line.name}</div>
                      {line.color && (
                        <div className="text-muted-foreground" style={{ fontSize: "12px" }}>
                          Цвет: {line.color}
                        </div>
                      )}
                      {line.lensLabel && (
                        <div className="text-muted-foreground" style={{ fontSize: "12px" }}>
                          Линзы: {line.lensLabel}
                          {line.lensPrice ? ` (+${formatPrice(line.lensPrice)})` : ""}
                        </div>
                      )}
                    </div>
                    <QtyControl
                      qty={line.qty}
                      onDec={() => setQty(line.slug, line.qty - 1, line.color, line.lensLabel)}
                      onInc={() => setQty(line.slug, line.qty + 1, line.color, line.lensLabel)}
                    />
                    <div style={{ fontWeight: 600, fontSize: "15px", minWidth: "72px", textAlign: "right", flexShrink: 0 }}>
                      {formatPrice(line.price * line.qty)}
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
                    Особые пожелания
                  </label>
                  <textarea
                    placeholder="Комментарий к заказу..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border"
                    style={{ borderRadius: "8px", padding: "10px 12px", fontSize: "15px", outline: "none", resize: "vertical" }}
                  />
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right — sticky sidebar */}
        <aside style={{ position: "sticky", top: "96px" }}>
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 4px oklch(0 0 0 / 0.06), 0 8px 20px oklch(0 0 0 / 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 400 }}>
                Ваш заказ
              </h3>
              <Link to="/basket" className="text-brand text-sm">
                Изменить
              </Link>
            </div>

            {lines.length > 0 && (
              <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {lines.map((line) => (
                  <div key={line.slug + (line.color ?? "")} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {line.image ? (
                      <img
                        src={line.image}
                        alt={line.name}
                        referrerPolicy="no-referrer"
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "6px",
                          backgroundColor: "var(--surface)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {line.name} ({line.qty} шт.)
                      </div>
                      {line.color && (
                        <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
                          {line.color}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "13px", flexShrink: 0 }}>
                      {formatPrice(line.price * line.qty)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                marginBottom: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <SummaryRow label="Товаров на" value={formatPrice(subtotal)} />
              <SummaryRow
                label="Доставка"
                value={isFree ? "Бесплатно" : "по тарифу"}
                valueStyle={isFree ? { color: "var(--success)", fontWeight: 500 } : undefined}
              />
              <SummaryRow label="Скидка" value="—" />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontWeight: 500 }}>Итого:</span>
              <span className="font-serif" style={{ fontSize: "22px", fontWeight: 700 }}>
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Promo */}
            <div style={{ marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setPromoVisible((v) => !v)}
                className="text-muted-foreground text-sm"
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <Tag size={14} />
                Есть промокод?
              </button>
              {promoVisible && (
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-background border border-border"
                    style={{ flex: 1, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none" }}
                  />
                  <button
                    type="button"
                    style={{
                      backgroundColor: "var(--ink)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Применить
                  </button>
                </div>
              )}
            </div>

            {/* Agreement */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setAgreed((v) => !v)}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: agreed ? "none" : "2px solid var(--border)",
                  backgroundColor: agreed ? "var(--brand)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                  marginTop: "2px",
                  padding: 0,
                }}
              >
                {agreed && <Check size={13} color="white" strokeWidth={3} />}
              </button>
              <p className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "1.5", margin: 0 }}>
                Я согласен(а) с{" "}
                <a href="/privacy" className="text-brand" style={{ textDecoration: "underline" }}>
                  условиями обработки данных
                </a>
              </p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={submit}
              style={{
                width: "100%",
                height: "52px",
                backgroundColor: "var(--brand)",
                color: "var(--brand-foreground)",
                border: "none",
                borderRadius: "9999px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {IS_PRIVATE_BETA ? "Оформление недоступно в бета" : "Оформить заказ"}
            </button>

            {/* Trust badges */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <TrustBadge icon={<Shield size={15} />} text="Безопасная оплата через защищённое соединение" />
              <TrustBadge icon={<Truck size={15} />} text="Бесплатная доставка при самовывозе" />
              <TrustBadge icon={<Phone size={15} />} text={`Поддержка специалистов ${CONTACT.phone.label}`} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressSteps() {
  const steps = ["Доставка", "Оплата", "Подтверждение"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: i === 0 ? "var(--brand)" : "var(--surface)",
                color: i === 0 ? "var(--brand-foreground)" : "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: "32px",
                height: "1px",
                backgroundColor: "var(--border)",
                margin: "0 10px",
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        overflow: "hidden",
        boxShadow: "0 1px 2px oklch(0 0 0 / 0.04), 0 2px 6px oklch(0 0 0 / 0.05)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "oklch(0.97 0.018 28)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>{title}</div>
          {!isOpen && subtitle && (
            <div
              className="text-muted-foreground"
              style={{ fontSize: "13px", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <ChevronDown
          size={18}
          className="text-muted-foreground"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", flexShrink: 0 }}
        />
      </button>
      {isOpen && (
        <div style={{ padding: "4px 20px 20px", borderTop: "1px solid var(--border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function RadioCard({
  label,
  sub,
  badge,
  badgeFree,
  selected,
  onClick,
}: {
  label: string;
  sub: string;
  badge?: string;
  badgeFree?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        backgroundColor: selected ? "oklch(0.97 0.018 28)" : "var(--surface)",
        border: selected ? "2px solid var(--brand)" : "2px solid transparent",
        borderRadius: "12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: selected ? "2px solid var(--brand)" : "2px solid var(--border)",
          backgroundColor: selected ? "var(--brand)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "white" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>{label}</div>
        <div className="text-muted-foreground" style={{ fontSize: "12px", marginTop: "2px" }}>
          {sub}
        </div>
      </div>
      {badge && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: badgeFree ? "oklch(0.65 0.15 150)" : "var(--foreground)",
            backgroundColor: badgeFree ? "oklch(0.95 0.04 150)" : "transparent",
            padding: badgeFree ? "2px 8px" : "0",
            borderRadius: badgeFree ? "999px" : "0",
            flexShrink: 0,
          }}
        >
          {badge}
        </div>
      )}
    </button>
  );
}

function CityChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: "9999px",
        border: "1px solid",
        borderColor: selected ? "var(--foreground)" : "var(--border)",
        backgroundColor: selected ? "var(--foreground)" : "transparent",
        color: selected ? "var(--background)" : "var(--foreground)",
        fontSize: "13px",
        fontWeight: selected ? 500 : 400,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function QtyControl({ qty, onDec, onInc }: { qty: number; onDec: () => void; onInc: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={onDec}
        disabled={qty <= 1}
        style={{
          width: "32px",
          height: "32px",
          border: "none",
          background: "none",
          cursor: qty <= 1 ? "not-allowed" : "pointer",
          opacity: qty <= 1 ? 0.4 : 1,
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        −
      </button>
      <span
        style={{
          width: "32px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 500,
          borderLeft: "1px solid var(--border)",
          borderRight: "1px solid var(--border)",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        style={{
          width: "32px",
          height: "32px",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        +
      </button>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div className="text-muted-foreground" style={{ flexShrink: 0 }}>{icon}</div>
      <span className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "1.4" }}>{text}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm" style={{ fontWeight: 500, ...valueStyle }}>{value}</span>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        className="text-sm"
        style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}
      >
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-background border border-border"
        style={{ borderRadius: "8px", padding: "10px 12px", fontSize: "15px", outline: "none" }}
      />
    </label>
  );
}
