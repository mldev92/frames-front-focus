import { CartPrescription } from "@/components/CartPrescription";
import { readAttempt, saveAttempt, forgetAttempt, checkAttempt, cancelAttempt, withCheckoutLock, orderFingerprint, ATTEMPT_STORAGE_KEY } from "@/lib/checkout-attempt";
import { StoreApiError } from "@/lib/api/security";
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
  Shield,
  Phone,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCart, formatPrice } from "@/lib/store/cart";
import { useCityStore } from "@/lib/store/city";
import { useIsMobile } from "@/hooks/use-mobile";
import { CONTACT } from "@/data/contact";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { formatPhone, isPhoneComplete } from "@/lib/checkout-phone";
import {
  CHECKOUT_STEPS,
  PROGRESS_INDEX,
  PROGRESS_LABELS,
  firstProblemStep,
  stepProblem,
} from "@/lib/checkout-steps";
import type { CheckoutStep, StepState } from "@/lib/checkout-steps";
import { getMe } from "@/lib/api/account";
import { checkCoupon, createOrder, getOrderDeliveryOptions, getStoreApiUrl, quoteOrder } from "@/lib/api/bitrix";
import type { CouponResult, DeliveryQuoteOption, PickupPointOption, CreateOrderInput, OrderQuote } from "@/lib/api/bitrix";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Оформление заказа · ОПТИКА 100%" },
      { name: "description", content: "Оформите доставку и оплату вашего заказа." },
    ],
  }),
  component: Checkout,
});

const QUICK_CITIES = ["Москва", "Санкт-Петербург", "Кемерово", "Новокузнецк"] as const;
const SPB_CITY = "Санкт-Петербург";
const SPB_LOCATION_CODE = "0000103664";

/** Выбранный город: код местоположения есть у города из поиска, у быстрых кнопок его определяет сервер. */
interface CheckoutLocation {
  name: string;
  code?: string;
  label: string;
}

const isSpbLocation = (location: CheckoutLocation | null) =>
  location?.name === SPB_CITY || location?.code === SPB_LOCATION_CODE;

const quickLocation = (name: string): CheckoutLocation => ({ name, label: name });
/** Код способа доставки: salon_pickup_spb, spb_courier, sdek_courier, sdek_pickup, salon_pickup_nvk_<id>. */
type DeliveryCode = string;
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
  /** Ставка НДС, % — входит в цену доставки. */
  vatRate?: number;
  vatAmount?: number;
  /** Служба доставки Bitrix (для виджета пунктов выдачи СДЭК). */
  serviceId?: number | null;
}

interface PickupPoint extends PickupPointOption {
  rawAddress?: string;
}

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
  {
    code: "sdek_pickup",
    label: "Самовывоз из пункта выдачи СДЭК",
    description: "Доставка заказа в один из пунктов самовывоза компании СДЭК",
    price: null,
    priceFormatted: "по тарифу",
    free: false,
    requiresPickupPoint: true,
  },
];

const CDEK_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    code: "sdek_courier",
    label: "СДЭК (Доставка курьером)",
    description: "Доставка заказа курьером компании СДЭК",
    price: null,
    priceFormatted: "уточняется",
    free: false,
    requiresAddress: true,
  },
  {
    code: "sdek_pickup",
    label: "СДЭК (Самовывоз)",
    description: "Доставка заказа в один из пунктов самовывоза компании СДЭК",
    price: null,
    priceFormatted: "уточняется",
    free: false,
    requiresPickupPoint: true,
  },
];

/** Способы, цену которых считает СДЭК: каждый запрашивается отдельно. Салоны всегда бесплатны. */
const CDEK_CODES: DeliveryCode[] = ["sdek_courier", "sdek_pickup"];
const SPB_CDEK_CODES: DeliveryCode[] = ["spb_courier", "sdek_pickup"];
const isSalonPickup = (code: DeliveryCode | undefined) => Boolean(code?.startsWith("salon_pickup_"));

/** НДС, уже включённый в цену доставки (как в старом оформлении). */
const includedVat = (price: number | null | undefined, rate: number | undefined) =>
  price && rate ? Math.round(((price * rate) / (100 + rate)) * 100) / 100 : 0;
const formatVat = (value: number) =>
  `${value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;

const getDeliveryOptions = (isSpb: boolean): DeliveryOption[] =>
  isSpb ? SPB_DELIVERY_OPTIONS : CDEK_DELIVERY_OPTIONS;

/** Понятное покупателю объяснение, почему расчёт доставки не удался. */
function describeDeliveryError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("рецепта")) {
    return "Для контактных линз в корзине не указаны параметры (оптическая сила, радиус кривизны). Откройте корзину, удалите эту позицию и добавьте линзы заново, выбрав параметры на странице товара.";
  }
  if (message.includes("больше недоступен")) {
    return "Один из товаров в корзине больше недоступен. Проверьте корзину.";
  }
  return message ? `Не удалось рассчитать доставку: ${message}` : "Не удалось рассчитать доставку.";
}

const PAYMENT_OPTIONS: Array<{ code: PaymentCode; label: string; sub: string }> = [
  {
    code: "cash_on_pickup",
    label: "Наличными или по карте при выдаче",
    sub: "Оплата при получении заказа в салоне.",
  },
  {
    code: "yookassa_card",
    label: "Оплата картой Юkassa",
    sub: "Онлайн-оплата банковской картой после подтверждения заказа.",
  },
  {
    code: "t_installment",
    label: "Т-Рассрочка",
    sub: "Рассрочка от Т-Банка — без переплат, до 12 месяцев.",
  },
];

function Checkout() {
  const isMobile = useIsMobile();
  const regionalCity = useCityStore((state) => state.city);
  const regionalCityHydrated = useCityStore((state) => state.hydrated);
  const { totals, lines, setQty, consume } = useCart();
  const { subtotal } = totals();

  const [step, setStep] = useState<CheckoutStep>("region");
  const [location, setLocation] = useState<CheckoutLocation | null>(() =>
    quickLocation(regionalCity === "nvk" ? "Новокузнецк" : SPB_CITY),
  );
  const city = location?.name ?? "";
  const isSpb = isSpbLocation(location);
  // Способ доставки не выбран заранее: покупатель выбирает сам, и только тогда доставка попадает в заказ.
  const [delivery, setDelivery] = useState<DeliveryCode | null>(null);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentCode>("cash_on_pickup");
  const [review, setReview] = useState<{ input: CreateOrderInput; quote: OrderQuote; fingerprint: string } | null>(null);
  const [acceptPending, setAcceptPending] = useState(false);
  const [hasAttempt, setHasAttempt] = useState(false);
  const [serverItemsTotal, setServerItemsTotal] = useState<number | null>(null);
  // Применённый промокод. Состав корзины изменился — код проверяем заново.
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const linesKey = JSON.stringify(lines);
  useEffect(() => setCoupon(null), [linesKey]);
  const [agreed, setAgreed] = useState(false);
  const [comment, setComment] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupPoint, setPickupPoint] = useState<PickupPoint | null>(null);
  const [pickupWidgetLoading, setPickupWidgetLoading] = useState(false);
  const [quotedDeliveryOptions, setQuotedDeliveryOptions] = useState<DeliveryQuoteOption[] | null>(
    null,
  );
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliveryRetry, setDeliveryRetry] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<string | null>(null);
  const pickupWidgetHostId = "optika100-sdek-widget-host";
  const pickupWidgetAssetFlag = "data-optika100-sdek-widget";

  useEffect(() => {
    if (!regionalCityHydrated) return;
    const nextCity = regionalCity === "nvk" ? "Новокузнецк" : SPB_CITY;
    setLocation(quickLocation(nextCity));
    setDelivery(null);
  }, [regionalCity, regionalCityHydrated]);

  const fallbackDeliveryOptions = useMemo(() => getDeliveryOptions(isSpb), [isSpb]);
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
      vatRate: option.vatRate,
      vatAmount: option.vatAmount,
      serviceId: option.serviceId,
    }));
  }, [fallbackDeliveryOptions, quotedDeliveryOptions]);
  const selectedDelivery = deliveryOptions.find((option) => option.code === delivery) ?? null;
  const paymentOptions = useMemo(
    () =>
      PAYMENT_OPTIONS.filter(
        (option) =>
          (option.code !== "cash_on_pickup" || isSalonPickup(selectedDelivery?.code)) &&
          (option.code !== "t_installment" || city !== "Новокузнецк"),
      ),
    [city, selectedDelivery?.code],
  );
  const selectedPayment =
    paymentOptions.find((option) => option.code === payment) ?? paymentOptions[0];
  const deliveryChosen = selectedDelivery !== null;
  const deliveryPrice = review ? review.quote.deliveryPrice : (selectedDelivery?.price ?? null);
  // В котировке itemsTotal уже со скидкой по промокоду; до котировки вычитаем проверенную скидку.
  const couponDiscount = review ? (review.quote.coupon?.discount ?? 0) : (coupon?.discount ?? 0);
  const itemsBeforeCoupon = review
    ? review.quote.itemsTotal + couponDiscount
    : (serverItemsTotal ?? subtotal);
  const orderTotal = review?.quote.total ?? itemsBeforeCoupon - couponDiscount + (deliveryPrice ?? 0);
  const isFree = deliveryPrice === 0;
  const deliveryVatRate = selectedDelivery?.vatRate ?? 0;
  const deliveryVat = selectedDelivery?.vatAmount || includedVat(deliveryPrice, deliveryVatRate);
  const storeApiBase =
    (import.meta.env.VITE_BITRIX_API as string | undefined)?.replace(/\/$/, "") ??
    "https://optika100.com";
  const getSdekWidgetUrl = (path: string) => {
    if (typeof window === "undefined") return getStoreApiUrl(path);
    return `${window.location.origin}/api/store/${path}`;
  };
  const getSameOriginStoreApiUrl = (path: string) => {
    return `${storeApiBase}/api/store/${path}`;
  };
  const pickupWidgetUrl = useMemo(() => {
    const widgetUrl = new URL(getSameOriginStoreApiUrl("sdek_widget_frame.php"));
    widgetUrl.searchParams.set("city", city);
    widgetUrl.searchParams.set(
      "deliveryId",
      String(deliveryOptions.find((option) => option.code === "sdek_pickup")?.serviceId ?? 55),
    );
    widgetUrl.searchParams.set("orderPrice", String(orderTotal));
    widgetUrl.searchParams.set("weight", "1000");
    return widgetUrl.toString();
  }, [city, orderTotal, deliveryOptions]);
  const pickupWidgetAjaxUrl = useMemo(() => getSdekWidgetUrl("sdek_ajax_proxy.php"), []);
  const pickupWidgetAssetProxyUrl = useMemo(() => getSdekWidgetUrl("sdek_asset_proxy.php"), []);
  const pickupWidgetAssetOrigin = useMemo(
    () => new URL(getStoreApiUrl("sdek_widget_frame.php")).origin,
    [],
  );

  // Оба способа СДЭК считаем сразу, параллельными запросами: сервер живой расчёт делает
  // только для одного способа за запрос, а покупателю нужны цены обоих до выбора.
  useEffect(() => {
    let cancelled = false;
    setQuotedDeliveryOptions(null);
    setServerItemsTotal(null);
    setPickupPoint(null);
    setDeliveryError(null);
    if (!lines.length || !location) return;
    setDeliveryLoading(true);
    const codes: Array<DeliveryCode | undefined> = isSpb ? SPB_CDEK_CODES : CDEK_CODES;
    Promise.allSettled(
      codes.map((deliveryCode) =>
        getOrderDeliveryOptions({ city, locationCode: location.code, lines, deliveryCode }),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const firstOk = results.find((result) => result.status === "fulfilled");
        if (!firstOk || firstOk.status !== "fulfilled") {
          const reason = (results[0] as PromiseRejectedResult).reason;
          console.error("[checkout] delivery quote:", reason);
          setDeliveryError(describeDeliveryError(reason));
          return;
        }
        const merged = firstOk.value.options.map((option) => {
          const index = codes.indexOf(option.code);
          const own = index >= 0 ? results[index] : undefined;
          if (!own || own.status === "fulfilled") {
            return own?.status === "fulfilled"
              ? (own.value.options.find((item) => item.code === option.code) ?? option)
              : option;
          }
          return { ...option, price: null, errors: [describeDeliveryError(own.reason)] };
        });
        setQuotedDeliveryOptions(merged);
        setServerItemsTotal(firstOk.value.itemsTotal);
      })
      .finally(() => {
        if (!cancelled) setDeliveryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, location, isSpb, lines, deliveryRetry]);

  useEffect(() => {
    if (delivery !== null && !deliveryOptions.some((option) => option.code === delivery)) {
      setDelivery(null);
      setAddress("");
      setPickupPoint(null);
    }
  }, [delivery, deliveryOptions]);

  useEffect(() => {
    if (!paymentOptions.some((option) => option.code === payment)) {
      setPayment(paymentOptions[0].code);
    }
  }, [payment, paymentOptions]);

  const formatPickupAddress = (point: Pick<PickupPoint, "address">) =>
    point.address.toLowerCase().includes(city.toLowerCase())
      ? point.address
      : `${city}, ${point.address}`;

  const stripPickupMarker = (value: string) => value.replace(/\s+#S[^\s]+$/u, "").trim();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const allowedOrigin = new URL(pickupWidgetUrl).origin;
      if (event.origin !== allowedOrigin) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;

      if (payload.type === "optika100-sdek-selected" && payload.point) {
        const point = payload.point as PickupPoint;
        const rawAddress = payload.displayAddress?.trim() || formatPickupAddress(point);
        const normalizedAddress = stripPickupMarker(rawAddress);
        setPickupPoint({ ...point, address: normalizedAddress, rawAddress });
        setAddress(normalizedAddress);
        setPickupWidgetLoading(false);
        cleanupInjectedWidget();
        toast.success("Пункт самовывоза СДЭК выбран");
      }

      if (payload.type === "optika100-sdek-error") {
        setPickupWidgetLoading(false);
        cleanupInjectedWidget();
        toast.error(payload.message || "Не удалось загрузить карту пунктов СДЭК");
      }
    };

    const onWidgetSelected = (event: Event) => {
      onMessage(
        new MessageEvent("message", {
          data: (event as CustomEvent).detail,
          origin: window.location.origin,
        }),
      );
    };

    const onWidgetError = (event: Event) => {
      onMessage(
        new MessageEvent("message", {
          data: (event as CustomEvent).detail,
          origin: window.location.origin,
        }),
      );
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

  const isAllowedWidgetScript = (script: HTMLScriptElement) => {
    const src = script.getAttribute("src")?.toLowerCase() ?? "";
    if (!src) {
      const body = script.textContent ?? "";
      return (
        body.includes("IPOL_JSloader") ||
        body.includes("IPOLSDEK_pvz") ||
        body.includes("BX.message") ||
        body.includes("BX.setJSList") ||
        body.includes("BX.setCSSList") ||
        body.includes("main.popup") ||
        body.includes("optika100-sdek")
      );
    }

    return (
      src.includes("api-maps.yandex.ru") ||
      src.includes("/bitrix/js/ipol.sdek/") ||
      src.includes("/bitrix/js/main/jquery/") ||
      src.includes("/bitrix/js/main/core/core.js") ||
      src.includes("/bitrix/cache/js/") ||
      src.includes("/bitrix/js/main/popup/dist/main.popup.bundle.js")
    );
  };

  const isAllowedWidgetStyle = (node: Element) => {
    const href = node.getAttribute("href")?.toLowerCase() ?? "";
    if (!href) return true;
    return (
      href.includes("/bitrix/js/ipol.sdek/") ||
      href.includes("/bitrix/cache/css/") ||
      href.includes("/bitrix/js/main/popup/dist/") ||
      href.includes("/bitrix/css/main/")
    );
  };

  const resolveWidgetUrl = (value: string | null) => {
    if (!value) return value;
    if (value.startsWith("/bitrix/images/ipol.sdek/")) {
      return `${pickupWidgetAssetProxyUrl}?path=${encodeURIComponent(value)}`;
    }
    if (value.startsWith(`${pickupWidgetAssetOrigin}/bitrix/images/ipol.sdek/`)) {
      const path = new URL(value).pathname;
      return `${pickupWidgetAssetProxyUrl}?path=${encodeURIComponent(path)}`;
    }
    if (value.startsWith("/bitrix/") || value.startsWith("/upload/")) {
      return `${pickupWidgetAssetOrigin}${value}`;
    }
    return new URL(value, pickupWidgetUrl).toString();
  };

  const normalizeInlineWidgetScript = (code: string) => {
    return code
      .replaceAll('"/bitrix/js/ipol.sdek/ajax.php"', `"${pickupWidgetAjaxUrl}"`)
      .replaceAll("'/bitrix/js/ipol.sdek/ajax.php'", `'${pickupWidgetAjaxUrl}'`)
      .replaceAll('"/bitrix/js/ipol.sdek/ajax.php', `"${pickupWidgetAjaxUrl}`)
      .replaceAll("'/bitrix/js/ipol.sdek/ajax.php", `'${pickupWidgetAjaxUrl}`)
      .replaceAll(`${pickupWidgetAssetOrigin}/bitrix/js/ipol.sdek/ajax.php`, pickupWidgetAjaxUrl)
      .replaceAll(
        '"/bitrix/images/ipol.sdek/',
        `"${pickupWidgetAssetProxyUrl}?path=${encodeURIComponent("/bitrix/images/ipol.sdek/")}`,
      )
      .replaceAll(
        "'/bitrix/images/ipol.sdek/",
        `'${pickupWidgetAssetProxyUrl}?path=${encodeURIComponent("/bitrix/images/ipol.sdek/")}`,
      )
      .replaceAll('"/bitrix/', `"${pickupWidgetAssetOrigin}/bitrix/`)
      .replaceAll("'/bitrix/", `'${pickupWidgetAssetOrigin}/bitrix/`)
      .replaceAll('"/upload/', `"${pickupWidgetAssetOrigin}/upload/`)
      .replaceAll("'/upload/", `'${pickupWidgetAssetOrigin}/upload/`);
  };

  const rewriteWidgetElementUrls = (root: ParentNode) => {
    root.querySelectorAll("[src]").forEach((node) => {
      const element = node as HTMLElement;
      const src = element.getAttribute("src");
      const nextSrc = resolveWidgetUrl(src);
      if (nextSrc) element.setAttribute("src", nextSrc);
    });
    root.querySelectorAll("[href]").forEach((node) => {
      const element = node as HTMLElement;
      const href = element.getAttribute("href");
      if (!href || href.startsWith("javascript:") || href.startsWith("#")) return;
      const nextHref = resolveWidgetUrl(href);
      if (nextHref) element.setAttribute("href", nextHref);
    });
  };

  const loadExternalScript = async (script: HTMLScriptElement) => {
    const src = resolveWidgetUrl(script.getAttribute("src"));
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
    next.textContent = normalizeInlineWidgetScript(script.textContent ?? "");
    document.body.appendChild(next);
  };

  const cleanupInjectedWidget = () => {
    document.querySelectorAll(`[${pickupWidgetAssetFlag}]`).forEach((node) => node.remove());
    document.getElementById(pickupWidgetHostId)?.remove();
  };

  const injectWidgetDocument = async (html: string) => {
    cleanupInjectedWidget();
    const parsed = new DOMParser().parseFromString(html, "text/html");

    parsed.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      if (!isAllowedWidgetStyle(node)) return;
      const clone = node.cloneNode(true) as HTMLElement;
      if (clone.hasAttribute("href")) {
        const href = resolveWidgetUrl(clone.getAttribute("href"));
        if (href) clone.setAttribute("href", href);
      }
      clone.setAttribute(pickupWidgetAssetFlag, "true");
      document.head.appendChild(clone);
    });

    const host = document.createElement("div");
    host.id = pickupWidgetHostId;
    host.setAttribute(pickupWidgetAssetFlag, "true");
    const bodyNodes = Array.from(parsed.body.childNodes).filter(
      (node) => node.nodeName.toLowerCase() !== "script",
    );
    bodyNodes.forEach((node) => host.appendChild(node.cloneNode(true)));
    rewriteWidgetElementUrls(host);
    document.body.appendChild(host);

    for (const script of Array.from(parsed.head.querySelectorAll("script")).filter(
      isAllowedWidgetScript,
    )) {
      await loadExternalScript(script);
    }
    for (const script of Array.from(parsed.body.querySelectorAll("script")).filter(
      isAllowedWidgetScript,
    )) {
      await loadExternalScript(script);
    }
  };

  const openCdekPickupMap = async () => {
    if (isSpb) return;
    setPickupWidgetLoading(true);
    try {
      cleanupInjectedWidget();
      const runtimeWidgetUrl = new URL(pickupWidgetUrl);
      runtimeWidgetUrl.searchParams.set("_", String(Date.now()));

      // Create modal overlay
      const overlay = document.createElement("div");
      overlay.id = pickupWidgetHostId;
      overlay.setAttribute(pickupWidgetAssetFlag, "true");
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;";

      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕";
      closeBtn.style.cssText =
        "position:absolute;top:16px;right:16px;z-index:1;width:40px;height:40px;border-radius:50%;border:none;background:white;font-size:20px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);";
      closeBtn.onclick = () => {
        setPickupWidgetLoading(false);
        cleanupInjectedWidget();
      };

      // Iframe
      const iframe = document.createElement("iframe");
      iframe.src = runtimeWidgetUrl.toString();
      iframe.style.cssText =
        "width:min(100vw,900px);height:min(100vh,700px);border:none;border-radius:12px;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,0.2);";
      iframe.onload = () => setPickupWidgetLoading(false);
      iframe.onerror = () => {
        setPickupWidgetLoading(false);
        toast.error("Не удалось загрузить виджет СДЭК");
      };

      overlay.appendChild(closeBtn);
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);

      // Close on overlay click (not iframe)
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          setPickupWidgetLoading(false);
          cleanupInjectedWidget();
        }
      });
    } catch (error) {
      console.error("[checkout] sdek widget:", error);
      toast.error("Не удалось открыть виджет СДЭК");
      setPickupWidgetLoading(false);
    }
  };

  useEffect(() => {
    setReview(null);
    setAcceptPending(false);
  }, [lines, city, location, delivery, payment, address, pickupPoint, fullName, phone, email, comment]);

  useEffect(() => {
    try {
      const attempt = readAttempt();
      setHasAttempt(Boolean(attempt));
      if (!attempt) return;
      const input = attempt.input;
      setFullName(input.customer.fullName); setPhone(formatPhone(input.customer.phone)); setEmail(input.customer.email);
      setLocation({ name: input.city, code: input.locationCode, label: input.city });
      setDelivery(input.deliveryCode); setPayment(input.paymentCode);
      setAddress(input.address ?? ""); setComment(input.comment ?? "");
      if (input.pickupPoint) setPickupPoint(input.pickupPoint as PickupPoint);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Не удалось прочитать попытку"); }
  }, []);

  // Prefill buyer data from the logged-in account (the native Bitrix form did this).
  // Only empty fields are filled, so typed or recovered-attempt values always win.
  useEffect(() => {
    let alive = true;
    getMe()
      .then((me) => {
        if (!alive || !me.authorized) return;
        setFullName((prev) => prev || me.fullName || "");
        setPhone((prev) => prev || formatPhone(me.phone || ""));
        setEmail((prev) => prev || me.email || "");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const stepIndex = CHECKOUT_STEPS.indexOf(step);
  const stepState: StepState = {
    hasLocation: Boolean(location),
    deliveryLoading,
    hasDelivery: deliveryChosen,
    deliveryRequiresPickupPoint: Boolean(selectedDelivery?.requiresPickupPoint),
    deliveryRequiresAddress: Boolean(selectedDelivery?.requiresAddress),
    hasPickupPoint: Boolean(pickupPoint),
    address,
    hasPayment: Boolean(selectedPayment),
    fullName,
    email,
    phoneComplete: isPhoneComplete(phone),
    hasLines: lines.length > 0,
  };
  const currentProblem = stepProblem(step, stepState);
  const goToStep = (target: CheckoutStep) => setStep(target);
  const goNext = () => {
    if (currentProblem) { toast.error(currentProblem); return; }
    const next = CHECKOUT_STEPS[stepIndex + 1];
    if (next) goToStep(next);
  };
  const goBack = () => {
    const previous = CHECKOUT_STEPS[stepIndex - 1];
    if (previous) goToStep(previous);
  };
  /** Раздел открывается по клику на заголовок, только если все шаги перед ним пройдены. */
  const canOpenStep = (target: CheckoutStep) =>
    CHECKOUT_STEPS.slice(0, CHECKOUT_STEPS.indexOf(target)).every(
      (earlier) => stepProblem(earlier, stepState) === null,
    );
  const isLastStep = stepIndex === CHECKOUT_STEPS.length - 1;
  const sidebarDisabled =
    submitting || lines.length === 0 || (!isLastStep && Boolean(currentProblem));

  const recover = async () => {
    setSubmitting(true);
    try {
      await withCheckoutLock(async () => {
        const attempt = readAttempt();
        if (!attempt) { setHasAttempt(false); return; }
        const status = await checkAttempt(attempt.id);
        if (status.status === "complete" && status.result) {
          await useCart.persist.rehydrate();
          consume(attempt.input.lines, attempt.id); forgetAttempt(attempt.id); setHasAttempt(false);
          setCompletedOrder(status.result.accountNumber);
        } else toast.info(status.status === "validating" || status.status === "not_found"
          ? "Заказ не сохранён. Проверьте данные и повторите оформление."
          : "Результат ещё проверяется. Не создавайте новый заказ; обратитесь в салон.");
      });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Не удалось проверить заказ"); }
    finally { setSubmitting(false); }
  };

  const submit = async () => {
    if (submitting) return;
    if (!agreed) { toast.error("Необходимо согласиться с условиями"); return; }
    if (!lines.length) { toast.error("Корзина пуста"); return; }
    if (!selectedDelivery) { goToStep("delivery"); toast.error("Выберите способ доставки"); return; }
    const brokenStep = firstProblemStep(stepState);
    if (brokenStep) {
      goToStep(brokenStep);
      toast.error(stepProblem(brokenStep, stepState) ?? "Проверьте данные заказа");
      return;
    }
    const input: CreateOrderInput = {
      checkoutVersion: 2,
      customer: { fullName: fullName.trim(), phone: phone.trim(), email: email.trim() },
      lines, city, locationCode: location?.code, delivery: selectedDelivery.label, deliveryCode: selectedDelivery.code,
      payment: selectedPayment.label, paymentCode: selectedPayment.code,
      address: pickupPoint?.rawAddress ?? pickupPoint?.address ?? (address.trim() || undefined),
      pickupPoint: pickupPoint ? { id: pickupPoint.id, address: pickupPoint.rawAddress ?? pickupPoint.address } : undefined,
      comment: comment.trim() || undefined,
      coupon: coupon?.code,
    };
    setSubmitting(true);
    try {
      await withCheckoutLock(async () => {
        const previous = readAttempt();
        if (previous) {
          const status = await checkAttempt(previous.id);
          if (status.status === "complete" && status.result) {
            await useCart.persist.rehydrate();
            consume(previous.input.lines, previous.id); forgetAttempt(previous.id); setHasAttempt(false);
            setCompletedOrder(status.result.accountNumber); return;
          }
          if (!["validating", "not_found", "cancelled"].includes(status.status)) throw new Error("Предыдущий заказ ещё проверяется. Обратитесь в салон перед новой попыткой.");
          if (status.status === "cancelled") { forgetAttempt(previous.id); setHasAttempt(false); }
          else if (orderFingerprint(previous.input) !== orderFingerprint(input)) {
            if (!window.confirm("Предыдущий заказ не сохранён. Начать новую попытку с изменёнными данными?")) return;
            await cancelAttempt(previous.id);
            forgetAttempt(previous.id); setHasAttempt(false); setReview(null);
          }
        }
        await useCart.persist.rehydrate();
        if (JSON.stringify(useCart.getState().lines) !== JSON.stringify(input.lines)) {
          setReview(null);
          throw new Error("Корзина изменилась в другой вкладке. Проверьте обновлённый состав перед оформлением.");
        }
        const fingerprint = orderFingerprint(input);
        if (!review || review.fingerprint !== fingerprint || review.quote.expiresAt * 1000 <= Date.now()) {
          const quote = await quoteOrder(input);
          setReview({ input, quote, fingerprint }); setAcceptPending(false);
          toast.info("Проверьте рассчитанную стоимость и подтвердите заказ."); return;
        }
        if (review.quote.deliveryStatus === "pending_confirmation" && !acceptPending) throw new Error("Подтвердите согласование стоимости доставки с менеджером.");
        const approved = { ...input, quoteId: review.quote.quoteId, acceptPendingDelivery: acceptPending };
        const attempt = saveAttempt(approved);
        localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify({ ...attempt, input: approved }));
        setHasAttempt(true);
        const result = await createOrder(approved, attempt.id);
        await useCart.persist.rehydrate();
        consume(input.lines, attempt.id); forgetAttempt(attempt.id); setHasAttempt(false);
        setCompletedOrder(result.accountNumber);
      });
    } catch (error) {
      if (error instanceof StoreApiError && error.data.code === "quote_changed") { setReview(null); setAcceptPending(false); }
      toast.error(error instanceof Error ? error.message : "Не удалось подтвердить заказ. Корзина сохранена.");
    } finally { setSubmitting(false); }
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Заказ создан</h1>
        <p className="mt-4 text-muted-foreground">
          Номер заказа: <strong className="text-foreground">{completedOrder}</strong>. Мы свяжемся с
          вами для подтверждения доставки и оплаты.
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

      <ProgressSteps current={PROGRESS_INDEX[step]} />

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
            subtitle={location?.label ?? "Выберите город"}
            isOpen={step === "region"}
            locked={!canOpenStep("region")}
            onToggle={() => goToStep("region")}
            footer={<StepNav hint={currentProblem} onNext={goNext} nextDisabled={Boolean(currentProblem)} />}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {QUICK_CITIES.map((c) => (
                <CityChip
                  key={c}
                  label={c}
                  selected={city === c && !location?.code}
                  onClick={() => setLocation(quickLocation(c))}
                />
              ))}
            </div>
            <CityAutocomplete
              hasSelection={Boolean(location)}
              selectedLabel={location?.code ? location.label : ""}
              onSelect={(item) =>
                setLocation({ name: item.name, code: item.code, label: item.label })
              }
              onClear={() => setLocation(null)}
            />
            <p className="text-muted-foreground" style={{ fontSize: "12px", margin: "8px 0 0" }}>
              Выберите из списка название вашего города или введите его название.
            </p>
          </SectionCard>

          <SectionCard
            id="delivery"
            icon={<Truck size={18} />}
            title="Доставка"
            subtitle={selectedDelivery?.label ?? "Выберите способ доставки"}
            isOpen={step === "delivery"}
            locked={!canOpenStep("delivery")}
            onToggle={() => goToStep("delivery")}
            footer={
              <StepNav
                hint={currentProblem}
                onBack={goBack}
                onNext={goNext}
                nextDisabled={Boolean(currentProblem)}
              />
            }
          >
            {deliveryLoading && (
              <p className="text-muted-foreground text-sm" style={{ margin: "0 0 10px" }}>
                Рассчитываем стоимость доставки...
              </p>
            )}
            {deliveryError && !deliveryLoading && (
              <div
                role="alert"
                style={{
                  margin: "0 0 12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid oklch(0.85 0.08 60)",
                  backgroundColor: "oklch(0.97 0.03 80)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {deliveryError}{" "}
                <button
                  type="button"
                  onClick={() => setDeliveryRetry((n) => n + 1)}
                  className="text-brand"
                  style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Повторить расчёт
                </button>
              </div>
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
            {selectedDelivery?.requiresAddress && (
              <div style={{ marginTop: "16px" }}>
                <Field
                  label="Адрес доставки"
                  placeholder="Улица, дом, квартира"
                  required
                  name="address"
                  autoComplete="street-address"
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
            subtitle={selectedPayment.label}
            isOpen={step === "payment"}
            locked={!canOpenStep("payment")}
            onToggle={() => goToStep("payment")}
            footer={<StepNav hint={currentProblem} onBack={goBack} onNext={goNext} nextDisabled={Boolean(currentProblem)} />}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {paymentOptions.map((opt) => (
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
            isOpen={step === "buyer"}
            locked={!canOpenStep("buyer")}
            onToggle={() => goToStep("buyer")}
            footer={<StepNav hint={currentProblem} onBack={goBack} onNext={goNext} nextDisabled={Boolean(currentProblem)} />}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field
                label="Ф.И.О."
                placeholder="Иванов Иван Иванович"
                required
                name="name"
                autoComplete="name"
                value={fullName}
                onChange={setFullName}
              />
              <Field
                label="E-Mail"
                type="email"
                placeholder="example@mail.ru"
                required
                name="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
              />
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field
                label="Телефон"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                required
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                maxLength={18}
                value={phone}
                onChange={(value) => setPhone(formatPhone(value))}
                onFocus={() => setPhone((prev) => prev || "+7")}
              />
            </div>
          </SectionCard>

          <SectionCard
            id="items"
            icon={<ShoppingCart size={18} />}
            title="Товары в заказе"
            subtitle={lines.length > 0 ? `${lines.length} товар(а)` : "Корзина пуста"}
            isOpen={step === "items"}
            locked={!canOpenStep("items")}
            onToggle={() => goToStep("items")}
            footer={<StepNav hint={null} onBack={goBack} />}
          >
            {lines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Корзина пуста.{" "}
                <Link
                  to="/catalog_s/$category"
                  params={{ category: "opravy" }}
                  className="text-brand"
                >
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
                      alignItems: "flex-start",
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
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          flexShrink: 0,
                        }}
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
                      <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>
                        {line.name}
                      </div>
                      <CartPrescription line={line} />
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
                      {/* Количество и сумма — отдельной строкой под описанием: рядом с ним
                          на телефоне оставалось ~80px и текст ломался по буквам. */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginTop: "10px",
                        }}
                      >
                        <QtyControl
                          qty={line.qty}
                          onDec={() => setQty(line.lineId, line.qty - 1)}
                          onInc={() => setQty(line.lineId, line.qty + 1)}
                        />
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "15px",
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          {formatPrice(line.price * line.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "6px",
                    }}
                  >
                    Особые пожелания
                  </label>
                  <textarea
                    placeholder="Комментарий к заказу..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border"
                    style={{
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "15px",
                      outline: "none",
                      resize: "vertical",
                    }}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 className="font-serif" style={{ fontSize: "18px", fontWeight: 400 }}>
                Ваш заказ
              </h3>
              <Link to="/basket" className="text-brand text-sm">
                Изменить
              </Link>
            </div>

            {lines.length > 0 && (
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {lines.map((line) => (
                  <div
                    key={line.lineId}
                    style={{ display: "flex", gap: "10px", alignItems: "center" }}
                  >
                    {line.image ? (
                      <img
                        src={line.image}
                        alt={line.name}
                        referrerPolicy="no-referrer"
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          flexShrink: 0,
                        }}
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
                      <CartPrescription line={line} />
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
              <CouponField
                lines={lines}
                applied={coupon}
                onApplied={(result) => { setCoupon(result); setReview(null); }}
              />
              <SummaryRow label="Товаров на" value={formatPrice(itemsBeforeCoupon)} />
              <SummaryRow
                label="Доставка"
                value={
                  !deliveryChosen ? (
                    "Не выбрана"
                  ) : deliveryLoading && deliveryPrice === null ? (
                    <DeliveryCalculating label="Считаем доставку..." />
                  ) : deliveryPrice === null ? (
                    "Уточняется менеджером"
                  ) : (
                    formatPrice(deliveryPrice)
                  )
                }
                valueStyle={isFree ? { color: "var(--success)", fontWeight: 500 } : undefined}
              />
              {deliveryVat > 0 && (
                <SummaryRow
                  label={`НДС ${deliveryVatRate}%, включён в доставку`}
                  value={formatVat(deliveryVat)}
                />
              )}
              <SummaryRow
                label={couponDiscount > 0 ? "Скидка по промокоду" : "Скидка"}
                value={couponDiscount > 0 ? `−${formatPrice(couponDiscount)}` : "—"}
                valueStyle={couponDiscount > 0 ? { color: "var(--success)" } : undefined}
              />
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
              <span style={{ fontWeight: 500 }}>
                Итого:
                {!deliveryChosen && (
                  <span className="text-muted-foreground" style={{ display: "block", fontSize: "11px", fontWeight: 400 }}>
                    без доставки
                  </span>
                )}
              </span>
              <span className="font-serif" style={{ fontSize: "22px", fontWeight: 700 }}>
                {!deliveryChosen ? (
                  formatPrice(orderTotal)
                ) : deliveryLoading && deliveryPrice === null ? (
                  <DeliveryCalculating label="Считаем..." size={16} />
                ) : deliveryPrice === null ? (
                  "Уточняется"
                ) : (
                  formatPrice(orderTotal)
                )}
              </span>
            </div>

            {hasAttempt && <div className="mb-4 rounded-lg border border-amber-300 p-3 text-sm" role="status">
              Есть сохранённая попытка заказа. <button type="button" disabled={submitting} onClick={() => void recover()} className="underline">Проверить результат</button>
            </div>}
            {review && <div className="mb-4 rounded-lg border p-3 text-sm" aria-live="polite">
              <strong>Расчёт магазина</strong>
              {review.quote.lines.map((line) => <p key={line.lineId}>{lines.find((item) => item.lineId === line.lineId)?.name}: {line.qty} × {formatPrice(line.price)}</p>)}
              <p>Товары: {formatPrice(review.quote.itemsTotal)}</p>
              {review.quote.coupon && (review.quote.coupon.applied
                ? <p>Скидка по промокоду {review.quote.coupon.code}: −{formatPrice(review.quote.coupon.discount)} (уже в сумме товаров)</p>
                : <p className="text-destructive">Промокод {review.quote.coupon.code} не применён: {review.quote.coupon.message}</p>)}
              <p>Доставка: {review.quote.deliveryPrice === null ? "уточняется менеджером" : formatPrice(review.quote.deliveryPrice)}</p>
              <p>Итого: {review.quote.total === null ? "после согласования доставки" : formatPrice(review.quote.total)}</p>
              {review.quote.deliveryStatus === "pending_confirmation" && <label className="mt-2 flex gap-2">
                <input type="checkbox" checked={acceptPending} onChange={(event) => setAcceptPending(event.target.checked)} />
                Стоимость доставки и окончательную сумму согласует менеджер до оплаты.
              </label>}
              <p className="mt-2">Менеджер подтвердит заказ и при необходимости отправит ссылку на оплату.</p>
            </div>}

            {/* Agreement */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
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
              <p
                className="text-muted-foreground"
                style={{ fontSize: "12px", lineHeight: "1.5", margin: 0 }}
              >
                Я согласен(а) с{" "}
                <a
                  href="/politika-konfidentsialnosti/"
                  className="text-brand"
                  style={{ textDecoration: "underline" }}
                >
                  условиями обработки данных
                </a>
              </p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => (isLastStep ? void submit() : goNext())}
              disabled={sidebarDisabled}
              style={{
                width: "100%",
                height: "52px",
                backgroundColor: "var(--brand)",
                color: "var(--brand-foreground)",
                border: "none",
                borderRadius: "9999px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: sidebarDisabled ? "not-allowed" : "pointer",
                opacity: sidebarDisabled ? 0.55 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {!isLastStep ? "Далее" : submitting ? "Проверяем заказ..." : review ? "Подтвердить заказ" : "Рассчитать и проверить заказ"}
            </button>

            {/* Trust badges */}
            <div
              style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <TrustBadge
                icon={<Shield size={15} />}
                text="Безопасная оплата через защищённое соединение"
              />
              <TrustBadge icon={<Truck size={15} />} text="Бесплатный самовывоз из салона" />
              <TrustBadge
                icon={<Phone size={15} />}
                text={`Поддержка специалистов ${CONTACT.phone.label}`}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressSteps({ current }: { current: number }) {
  const steps = PROGRESS_LABELS;
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
                backgroundColor: i <= current ? "var(--brand)" : "var(--surface)",
                color: i <= current ? "var(--brand-foreground)" : "var(--muted-foreground)",
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
                fontWeight: i === current ? 600 : 400,
                color: i <= current ? "var(--foreground)" : "var(--muted-foreground)",
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
  locked,
  onToggle,
  footer,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  locked?: boolean;
  onToggle: () => void;
  footer?: ReactNode;
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
        disabled={locked && !isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: locked && !isOpen ? "not-allowed" : "pointer",
          opacity: locked && !isOpen ? 0.55 : 1,
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
              style={{
                fontSize: "13px",
                marginTop: "1px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <ChevronDown
          size={18}
          className="text-muted-foreground"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            flexShrink: 0,
          }}
        />
      </button>
      {isOpen && (
        <div style={{ padding: "4px 20px 20px", borderTop: "1px solid var(--border)" }}>
          {children}
          {footer}
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
          {selected && (
            <div
              style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "white" }}
            />
          )}
        </div>
        {option.logo && (
          <img
            src={option.logo}
            alt=""
            style={{
              width: "56px",
              maxHeight: "32px",
              objectFit: "contain",
              flexShrink: 0,
              marginTop: "1px",
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{option.label}</div>
          <div
            className="text-muted-foreground"
            style={{ fontSize: "12px", marginTop: "4px", lineHeight: 1.45 }}
          >
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
            <div
              className="text-muted-foreground"
              style={{ fontSize: "12px", marginTop: "10px", lineHeight: 1.45 }}
            >
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
        {selected && (
          <div
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "white" }}
          />
        )}
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

function CityChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
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
      <div className="text-muted-foreground" style={{ flexShrink: 0 }}>
        {icon}
      </div>
      <span className="text-muted-foreground" style={{ fontSize: "12px", lineHeight: "1.4" }}>
        {text}
      </span>
    </div>
  );
}

/**
 * Промокод: сервер проверяет код на текущей корзине по правилам Bitrix (те же, что в заказе).
 * В заказ уходит только применённый код; неподходящий показываем с причиной.
 */
function CouponField({
  lines,
  applied,
  onApplied,
}: {
  lines: CreateOrderInput["lines"];
  applied: CouponResult | null;
  onApplied: (result: CouponResult | null) => void;
}) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
        <span>
          Промокод <strong>{applied.code}</strong> применён
        </span>
        <button
          type="button"
          onClick={() => { onApplied(null); setValue(""); }}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Убрать
        </button>
      </div>
    );
  }

  const apply = async () => {
    const code = value.trim();
    if (!code || checking) return;
    setChecking(true);
    setError(null);
    try {
      const result = await checkCoupon({ lines, coupon: code });
      if (result.applied) {
        onApplied({ code: result.code, applied: true, discount: result.discount, message: result.message });
        toast.success(`Промокод применён: −${formatPrice(result.discount)}`);
      } else {
        setError(result.message);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось проверить промокод. Попробуйте ещё раз.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={(event) => { event.preventDefault(); void apply(); }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(event) => { setValue(event.target.value); setError(null); }}
          placeholder="Промокод"
          aria-label="Промокод"
          autoComplete="off"
          maxLength={64}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <button
          type="submit"
          disabled={!value.trim() || checking}
          className="shrink-0 rounded-lg border border-foreground px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
        >
          {checking ? "Проверяем…" : "Применить"}
        </button>
      </form>
      {error && (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: ReactNode;
  valueStyle?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm" style={{ fontWeight: 500, ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

function StepNav({
  hint,
  onBack,
  onNext,
  nextDisabled,
}: {
  hint: string | null;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div style={{ marginTop: "20px" }}>
      {hint && onNext && (
        <p className="text-muted-foreground" style={{ fontSize: "12px", margin: "0 0 10px" }}>
          {hint}
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "10px 22px",
              borderRadius: "9999px",
              border: "1px solid var(--border)",
              background: "transparent",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Назад
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            style={{
              padding: "10px 28px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "var(--brand)",
              color: "var(--brand-foreground)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: nextDisabled ? "not-allowed" : "pointer",
              opacity: nextDisabled ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        )}
      </div>
    </div>
  );
}

function DeliveryCalculating({ label, size = 13 }: { label: string; size?: number }) {
  return (
    <span
      className="text-muted-foreground"
      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 500 }}
    >
      <Loader2 size={size} className="animate-spin" />
      {label}
    </span>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  name,
  autoComplete,
  inputMode,
  maxLength,
  onFocus,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
  maxLength?: number;
  onFocus?: () => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <span className="text-sm" style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        name={name}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        onFocus={onFocus}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-background border border-border"
        style={{ borderRadius: "8px", padding: "10px 12px", fontSize: "15px", outline: "none" }}
      />
    </label>
  );
}
