import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { CONTACT } from "@/data/contact";
import { createOrder, getOrderDeliveryOptions, getStoreApiUrl } from "@/lib/api/bitrix";
import type { DeliveryQuoteOption, PickupPointOption } from "@/lib/api/bitrix";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Оформление заказа · ОПТИКА 100%" },
      { name: "description", content: "Оформите доставку и оплату вашего заказа." },
    ],
  }),
  component: Checkout,
});

const CITIES = ["Москва", "Санкт-Петербург", "Кемерово", "Новокузнецк"] as const;

type CheckoutCity = (typeof CITIES)[number];
type DeliveryCode = "salon_pickup_spb" | "spb_courier" | "sdek_courier" | "sdek_pickup";
type PaymentCode = "cash_on_pickup" | "yookassa_card" | "t_installment";

interface DeliveryOption {
  code: DeliveryCode;
  label: string;
  description: string;
  price: number | null;
  priceFormatted: string;
  free?: boolean;
  period?: string | null;
  logo?: string | null;
  requiresAddress?: boolean;
  requiresPickupPoint?: boolean;
  errors?: string[];
}

interface PickupPoint extends PickupPointOption {}

const SPB_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    code: "salon_pickup_spb",
    label: "Самовывоз из салона",
    description: "«Оптика 100%» · ул. Кирочная, 17, Санкт-Петербург (м. Чернышевская)",
    price: 0,
    priceFormatted: "Бесплатно",
    free: true,
  },
  {
    code: "spb_courier",
    label: "Курьер по СПб",
    description: "Доставка в течение 1-2 дней",
    price: null,
    priceFormatted: "по тарифу",
    free: false,
    requiresAddress: true,
  },
];

const CDEK_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    code: "sdek_courier",
    label: "СДЭК (Доставка курьером)",
    description: "Доставка заказа курьером компании СДЭК",
    price: null,
    priceFormatted: "по тарифу",
    period: "7-8 дней",
    free: false,
    requiresAddress: true,
  },
  {
    code: "sdek_pickup",
    label: "СДЭК (Самовывоз)",
    description: "Доставка заказа в один из пунктов самовывоза компании СДЭК",
    price: null,
    priceFormatted: "по тарифу",
    period: "7-8 дней",
    free: false,
    requiresPickupPoint: true,
  },
];

const getDeliveryOptions = (city: CheckoutCity): DeliveryOption[] =>
  city === "Санкт-Петербург" ? SPB_DELIVERY_OPTIONS : CDEK_DELIVERY_OPTIONS;

const PAYMENT_OPTIONS: Array<{ code: PaymentCode; label: string; sub: string }> = [
  {
    code: "cash_on_pickup",
    label: "Наличными или по карте при выдаче",
    sub: "Оплата при получении заказа в салоне, у курьера или в пункте выдачи.",
  },
  { code: "yookassa_card", label: "Оплата картой Юkassa", sub: "Онлайн-оплата банковской картой после подтверждения заказа." },
  { code: "t_installment", label: "Т-Рассрочка", sub: "Рассрочка от Т-Банка — без переплат, до 12 месяцев." },
];

function Checkout() {
  const isMobile = useIsMobile();
  const { totals, lines, setQty, clear } = useCart();
  const { subtotal } = totals();

  const [open, setOpen] = useState<string | null>("region");
  const [city, setCity] = useState<CheckoutCity>("Санкт-Петербург");
  const [citySearch, setCitySearch] = useState("");
  const [delivery, setDelivery] = useState<DeliveryCode>("salon_pickup_spb");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentCode>("cash_on_pickup");
  const [promoVisible, setPromoVisible] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [comment, setComment] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [pickupPoint, setPickupPoint] = useState<PickupPoint | null>(null);
  const [pickupWidgetLoading, setPickupWidgetLoading] = useState(false);
  const [quotedDeliveryOptions, setQuotedDeliveryOptions] = useState<DeliveryQuoteOption[] | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<string | null>(null);
  const pickupWidgetHostId = "optika100-sdek-widget-host";
  const pickupWidgetAssetFlag = "data-optika100-sdek-widget";

  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));
  const fallbackDeliveryOptions = useMemo(() => getDeliveryOptions(city), [city]);
  const deliveryOptions = useMemo<DeliveryOption[]>(() => {
    if (!quotedDeliveryOptions?.length) return fallbackDeliveryOptions;
    return quotedDeliveryOptions.map((option) => ({
      code: option.code,
      label: option.label,
      description: option.description,
      price: option.price,
      priceFormatted: option.priceFormatted,
      free: option.price === 0,
      period: option.period,
      logo: option.logo,
      requiresAddress: option.requiresAddress,
      requiresPickupPoint: option.requiresPickupPoint,
      errors: option.errors,
    }));
  }, [fallbackDeliveryOptions, quotedDeliveryOptions]);
  const selectedDelivery = deliveryOptions.find((option) => option.code === delivery) ?? deliveryOptions[0];
  const selectedPayment = PAYMENT_OPTIONS.find((option) => option.code === payment) ?? PAYMENT_OPTIONS[0];
  const deliveryPrice = selectedDelivery.price ?? 0;
  const orderTotal = subtotal + deliveryPrice;
  const isFree = selectedDelivery.price === 0 || selectedDelivery.free;
  const pickupWidgetUrl = useMemo(() => {
    const widgetUrl = new URL(getStoreApiUrl("sdek_widget_frame.php"));
    widgetUrl.searchParams.set("city", city);
    widgetUrl.searchParams.set("deliveryId", "55");
    widgetUrl.searchParams.set("orderPrice", String(orderTotal));
    widgetUrl.searchParams.set("weight", "1000");
    return widgetUrl.toString();
  }, [city, orderTotal]);

  useEffect(() => {
    let cancelled = false;
    setQuotedDeliveryOptions(null);
    setPickupPoint(null);
    if (!lines.length) return;
    setDeliveryLoading(true);
    getOrderDeliveryOptions({ city, lines })
      .then((result) => {
        if (!cancelled) setQuotedDeliveryOptions(result.options);
      })
      .catch((error) => {
        console.error("[checkout] delivery quote:", error);
        if (!cancelled) toast.error("Не удалось рассчитать доставку, показаны базовые варианты");
      })
      .finally(() => {
        if (!cancelled) setDeliveryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, lines]);

  useEffect(() => {
    if (!deliveryOptions.some((option) => option.code === delivery)) {
      setDelivery(deliveryOptions[0].code);
      setAddress("");
      setPickupPoint(null);
    }
  }, [delivery, deliveryOptions]);

  const formatPickupAddress = (point: Pick<PickupPoint, "address">) =>
    point.address.toLowerCase().includes(city.toLowerCase()) ? point.address : `${city}, ${point.address}`;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const allowedOrigin = new URL(pickupWidgetUrl).origin;
      if (event.origin !== allowedOrigin) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;

      if (payload.type === "optika100-sdek-selected" && payload.point) {
        const point = payload.point as PickupPoint;
        const normalizedAddress = payload.displayAddress?.trim() || formatPickupAddress(point);
        setPickupPoint({ ...point, address: normalizedAddress });
        setAddress(normalizedAddress);
        setPickupWidgetLoading(false);
        toast.success("Пункт самовывоза СДЭК выбран");
      }

      if (payload.type === "optika100-sdek-error") {
        setPickupWidgetLoading(false);
        toast.error(payload.message || "Не удалось загрузить карту пунктов СДЭК");
      }
    };

    const onWidgetSelected = (event: Event) => {
      onMessage(new MessageEvent("message", { data: (event as CustomEvent).detail, origin: window.location.origin }));
    };

    const onWidgetError = (event: Event) => {
      onMessage(new MessageEvent("message", { data: (event as CustomEvent).detail, origin: window.location.origin }));
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("optika100-sdek-selected", onWidgetSelected as EventListener);
    window.addEventListener("optika100-sdek-error", onWidgetError as EventListener);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("optika100-sdek-selected", onWidgetSelected as EventListener);
      window.removeEventListener("optika100-sdek-error", onWidgetError as EventListener);
    };
  }, [formatPickupAddress, pickupWidgetUrl]);

  const loadExternalScript = async (script: HTMLScriptElement) => {
    const src = script.getAttribute("src");
    if (src && document.querySelector(`script[src="${src}"]`)) return;
    const next = document.createElement("script");
    next.setAttribute(pickupWidgetAssetFlag, "true");
    if (src) {
      next.src = src;
      next.async = false;
      await new Promise<void>((resolve, reject) => {
        next.onload = () => resolve();
        next.onerror = () => reject(new Error(`Не удалось загрузить ${src}`));
        document.body.appendChild(next);
      });
      return;
    }
    next.textContent = script.textContent;
    document.body.appendChild(next);
  };

  const cleanupInjectedWidget = () => {
    document.querySelectorAll(`[${pickupWidgetAssetFlag}]`).forEach((node) => node.remove());
    document.getElementById(pickupWidgetHostId)?.remove();
    document.getElementById("SDEK_mask")?.remove();
    document.getElementById("SDEK_pvz")?.remove();
    document.getElementById("SDEK_preloader")?.remove();
    document.getElementById("popup-window-overlay-loading_screen")?.remove();
  };

  const injectWidgetDocument = async (html: string) => {
    cleanupInjectedWidget();
    const parsed = new DOMParser().parseFromString(html, "text/html");

    parsed.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute(pickupWidgetAssetFlag, "true");
      document.head.appendChild(clone);
    });

    const host = document.createElement("div");
    host.id = pickupWidgetHostId;
    host.setAttribute(pickupWidgetAssetFlag, "true");
    const bodyNodes = Array.from(parsed.body.childNodes).filter((node) => node.nodeName.toLowerCase() !== "script");
    bodyNodes.forEach((node) => host.appendChild(node.cloneNode(true)));
    document.body.appendChild(host);

    for (const script of Array.from(parsed.head.querySelectorAll("script"))) {
      await loadExternalScript(script);
    }
    for (const script of Array.from(parsed.body.querySelectorAll("script"))) {
      await loadExternalScript(script);
    }
  };

  const openCdekPickupMap = async () => {
    if (city === "Санкт-Петербург") return;
    setPickupWidgetLoading(true);
    try {
      const response = await fetch(pickupWidgetUrl, { credentials: "include" });
      if (!response.ok) throw new Error(`Widget ${response.status}`);
      const html = await response.text();
      await injectWidgetDocument(html);
    } catch (error) {
      console.error("[checkout] sdek widget:", error);
      toast.error("Не удалось открыть виджет СДЭК");
      setPickupWidgetLoading(false);
    }
  };

  const submit = async () => {
    if (!agreed) {
      toast.error("Необходимо согласиться с условиями");
      return;
    }
    if (!lines.length) {
      toast.error("Корзина пуста");
      return;
    }
    if (selectedDelivery.requiresPickupPoint && !pickupPoint) {
      setOpen("delivery");
      toast.error("Выберите пункт самовывоза СДЭК");
      return;
    }
    if (!fullName.trim() || phone.replace(/\D/g, "").length < 10
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !address.trim()) {
      setOpen("buyer");
      toast.error("Проверьте контактные данные");
      return;
    }
    setSubmitting(true);
    try {
      const idempotencyKey = crypto.randomUUID().replace(/-/g, "");
      const result = await createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        lines,
        city,
        delivery: selectedDelivery.label,
        deliveryCode: selectedDelivery.code,
        payment: selectedPayment.label,
        paymentCode: selectedPayment.code,
        address: address.trim() || undefined,
        pickupPoint: pickupPoint ?? undefined,
        trackNumber: trackNumber.trim() || undefined,
        comment: comment.trim() || undefined,
      }, idempotencyKey);
      setCompletedOrder(result.accountNumber);
      clear();
      toast.success(`Заказ №${result.accountNumber} создан`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось создать заказ");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Заказ создан</h1>
        <p className="mt-4 text-muted-foreground">
          Номер заказа: <strong className="text-foreground">{completedOrder}</strong>. Мы свяжемся
          с вами для подтверждения доставки и оплаты.
        </p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-brand px-7 py-3 text-white">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
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
          gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 1fr) 380px",
          gap: isMobile ? "32px" : "48px",
          alignItems: "start",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {/* Left — accordion sections */}
        <div style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: "12px" }}>

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
            subtitle={selectedDelivery.label}
            isOpen={open === "delivery"}
            onToggle={() => toggle("delivery")}
          >
            {deliveryLoading && (
              <p className="text-muted-foreground text-sm" style={{ margin: "0 0 10px" }}>
                Рассчитываем стоимость доставки...
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {deliveryOptions.map((opt) => (
                <DeliveryCard
                  key={opt.code}
                  option={opt}
                  pickupPoint={opt.code === "sdek_pickup" ? pickupPoint : null}
                  pickupWidgetLoading={pickupWidgetLoading}
                  selected={delivery === opt.code}
                  onClick={() => {
                    setDelivery(opt.code);
                    if (opt.code !== "sdek_pickup") setPickupPoint(null);
                  }}
                  onChoosePickup={opt.code === "sdek_pickup" ? openCdekPickupMap : undefined}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            id="payment"
            icon={<CreditCard size={18} />}
            title="Оплата"
            subtitle={selectedPayment.label}
            isOpen={open === "payment"}
            onToggle={() => toggle("payment")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PAYMENT_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.label}
                  label={opt.label}
                  sub={opt.sub}
                  selected={payment === opt.code}
                  onClick={() => setPayment(opt.code)}
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
              <Field label="Ф.И.О." placeholder="Иванов Иван Иванович" required value={fullName} onChange={setFullName} />
              <Field label="E-Mail" type="email" placeholder="example@mail.ru" required value={email} onChange={setEmail} />
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field label="Телефон" type="tel" placeholder="+7 (___) ___-__-__" required value={phone} onChange={setPhone} />
              <Field label="Трек-номер СДЭК" placeholder="Если уже есть" value={trackNumber} onChange={setTrackNumber} />
            </div>
            <div style={{ marginTop: "12px" }}>
              <Field
                label="Адрес доставки"
                placeholder="Город, улица, дом, квартира"
                required
                value={address}
                onChange={setAddress}
              />
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
                    key={line.lineId}
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
                      {line.parameters.color && (
                        <div className="text-muted-foreground" style={{ fontSize: "12px" }}>
                          Цвет: {line.parameters.color}
                        </div>
                      )}
                      {line.parameters.purpose && (
                        <div className="text-muted-foreground" style={{ fontSize: "12px" }}>
                          Назначение: {line.parameters.purpose}
                        </div>
                      )}
                    </div>
                    <QtyControl
                      qty={line.qty}
                      onDec={() => setQty(line.lineId, line.qty - 1)}
                      onInc={() => setQty(line.lineId, line.qty + 1)}
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
        <aside style={{ position: "sticky", top: "96px", minWidth: 0, maxWidth: "100%" }}>
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
                  <div key={line.lineId} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                      {line.parameters.color && (
                        <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
                          {line.parameters.color}
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
                value={selectedDelivery.priceFormatted}
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
                {formatPrice(orderTotal)}
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
                <a href="/politika-konfidentsialnosti/" className="text-brand" style={{ textDecoration: "underline" }}>
                  условиями обработки данных
                </a>
              </p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting || lines.length === 0}
              style={{
                width: "100%",
                height: "52px",
                backgroundColor: "var(--brand)",
                color: "var(--brand-foreground)",
                border: "none",
                borderRadius: "9999px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: submitting || lines.length === 0 ? "not-allowed" : "pointer",
                opacity: submitting || lines.length === 0 ? 0.55 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {submitting ? "Создаём заказ..." : "Оформить заказ"}
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        alignItems: "center",
        marginBottom: "32px",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
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
                fontSize: "clamp(10px, 3vw, 13px)",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <span
              className="hidden sm:inline"
              style={{
                fontSize: "13px",
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? "var(--foreground)" : "var(--muted-foreground)",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                minWidth: "4px",
                height: "1px",
                backgroundColor: "var(--border)",
                margin: "0 clamp(3px, 2vw, 10px)",
                flex: 1,
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

function DeliveryCard({
  option,
  pickupPoint,
  pickupWidgetLoading,
  selected,
  onClick,
  onChoosePickup,
}: {
  option: DeliveryOption;
  pickupPoint: PickupPoint | null;
  pickupWidgetLoading: boolean;
  selected: boolean;
  onClick: () => void;
  onChoosePickup?: () => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: selected ? "oklch(0.97 0.018 28)" : "var(--surface)",
        border: selected ? "2px solid var(--brand)" : "2px solid transparent",
        borderRadius: "12px",
        transition: "all 0.15s ease",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            marginTop: "2px",
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
        {option.logo && (
          <img
            src={option.logo}
            alt=""
            style={{ width: "56px", maxHeight: "32px", objectFit: "contain", flexShrink: 0, marginTop: "1px" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{option.label}</div>
          <div className="text-muted-foreground" style={{ fontSize: "12px", marginTop: "4px", lineHeight: 1.45 }}>
            {option.description}
          </div>
          {(option.priceFormatted || option.period) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "4px 10px",
                marginTop: "10px",
                fontSize: "13px",
              }}
            >
              <span className="text-muted-foreground">Стоимость:</span>
              <strong>{option.priceFormatted}</strong>
              {option.period && (
                <>
                  <span className="text-muted-foreground">Срок доставки:</span>
                  <strong>{option.period}</strong>
                </>
              )}
            </div>
          )}
          {pickupPoint && (
            <div className="text-muted-foreground" style={{ fontSize: "12px", marginTop: "10px", lineHeight: 1.45 }}>
              Выбран пункт: {pickupPoint.address}
            </div>
          )}
        </div>
      </button>
      {selected && option.requiresPickupPoint && onChoosePickup && (
        <div style={{ padding: "0 16px 14px 46px" }}>
          <button
            type="button"
            onClick={onChoosePickup}
            disabled={pickupWidgetLoading}
            style={{
              border: "1px solid var(--brand)",
              background: "white",
              color: "var(--brand)",
              borderRadius: "8px",
              padding: "9px 12px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: pickupWidgetLoading ? "wait" : "pointer",
              opacity: pickupWidgetLoading ? 0.7 : 1,
            }}
          >
            {pickupWidgetLoading
              ? "Загружаем карту..."
              : pickupPoint
                ? "Изменить пункт самовывоза"
                : "Выбрать пункт самовывоза"}
          </button>
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
