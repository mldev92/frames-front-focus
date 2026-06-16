import { ArrowRight, Check } from "lucide-react";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/store/cart";
import { getProductDisplayBrand } from "@/lib/product";
import { PrescriptionInput } from "@/components/PrescriptionInput";
import type { Prescription } from "@/lib/store/cart";
import { Reveal } from "@/components/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const INCLUDED_FEATURES = [
  "Однодневная сборка в салоне",
  "Бесплатная подгонка по лицу",
  "Покрытие от царапин на 12 месяцев",
  "Защита от ультрафиолета и бликов",
  "Жёсткий футляр и салфетка из микрофибры",
  "Возврат и обмен в течение 14 дней",
  "Гарантия лучшей цены",
];

const MEASUREMENTS = [
  {
    labels: ["Длина дужки", "Длина заушника"],
    displayLabel: "Длина заушника",
    icon: "/icon_param_glasses_length.svg",
  },
  {
    labels: ["Ширина моста", "Ширина переносицы"],
    displayLabel: "Ширина переносицы",
    icon: "/icon_param_bridge_length.svg",
  },
  {
    labels: ["Ширина окуляра", "Ширина линзы", "Ширина ободка"],
    displayLabel: "Ширина линзы",
    icon: "/icon_param_hinge_distance.svg",
  },
] as const;

interface ProductInfoSectionsProps {
  product: Product;
  showPrescription: boolean;
  prescriptionVariant: "frames" | "contacts";
  prescription?: Prescription;
  onPrescriptionChange?: (value: Prescription) => void;
}

export function ProductInfoSections({
  product,
  showPrescription,
  prescriptionVariant,
  prescription,
  onPrescriptionChange,
}: ProductInfoSectionsProps) {
  const brand = getProductDisplayBrand(product);
  const showFrameValueCard = product.category === "opravy";
  const isLensProduct =
    product.category === "kontaktnye-linzy" || product.category === "linzy-dlya-ochkov";
  const measurements = MEASUREMENTS.flatMap((measurement) => {
    const spec = product.specs.find((item) =>
      (measurement.labels as readonly string[]).includes(item.label),
    );
    return spec ? [{ ...measurement, value: spec.value }] : [];
  });
  const measurementLabels = new Set<string>(MEASUREMENTS.flatMap((item) => [...item.labels]));
  const sourceSpecs =
    isLensProduct && product.characteristics?.length ? product.characteristics : product.specs;
  const detailSpecs = sourceSpecs.filter((spec) => !measurementLabels.has(spec.label));
  const showDescription = isLensProduct && Boolean(product.descriptionHtml?.trim());
  const showCharacteristics = measurements.length > 0 || detailSpecs.length > 0;

  return (
    <div className="mt-14 flex flex-col gap-14">
      {showFrameValueCard && (
        <Reveal>
          <section className="rounded-2xl border border-border/70 bg-cream px-5 py-7 sm:px-8">
            <SectionHeading
              title={`Что входит за ${formatPrice(product.price)}`}
              note="Всё уже включено в цену оправы"
            />
            <div className="grid sm:grid-cols-2 sm:gap-x-10">
              {INCLUDED_FEATURES.map((feature, index) => (
                <Reveal
                  key={feature}
                  delay={index * 60}
                  className="flex items-center gap-3 border-b border-border/70 py-3 text-sm last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Check className="product-included-check h-3.5 w-3.5" />
                  </span>
                  <span>{feature}</span>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {showDescription && (
        <Reveal>
          <section>
            <SectionHeading title="Описание" />
            <div
              className="max-w-3xl text-sm leading-7 text-muted-foreground [&_a]:text-brand [&_a]:underline [&_br]:block [&_br]:content-[''] [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mb-1.5 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? "" }}
            />
          </section>
        </Reveal>
      )}

      {showCharacteristics && (
        <Reveal>
          <section>
            <SectionHeading title="Характеристики" />
            {measurements.length > 0 && (
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {measurements.map((measurement, index) => (
                  <Reveal key={measurement.displayLabel} delay={index * 80}>
                    <div className="group flex min-h-40 flex-col rounded-xl border border-border bg-card p-5 transition duration-300 ease-editorial hover:-translate-y-1 hover:shadow-md">
                      <img
                        src={measurement.icon}
                        alt=""
                        className="h-9 w-auto self-start opacity-70 transition-opacity group-hover:opacity-100"
                      />
                      <div className="mt-auto pt-5 font-serif text-2xl leading-none">
                        {measurement.value.replace(/\s*мм\s*$/i, "")}
                        <span className="ml-1 font-sans text-sm text-muted-foreground">мм</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {measurement.displayLabel}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            <dl className="grid gap-x-10 sm:grid-cols-2">
              {detailSpecs.map((spec) => (
                <div
                  key={`${spec.label}-${spec.value}`}
                  className="flex justify-between gap-5 border-b border-border py-3 text-sm"
                >
                  <dt className="text-muted-foreground">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      )}

      {showPrescription && prescriptionVariant === "contacts" && prescription && onPrescriptionChange && (
        <Reveal>
          <section>
            <SectionHeading
              title="Нужен рецепт?"
              note="Можно добавить сейчас или после оформления"
            />
            <PrescriptionInput
              product={product}
              value={prescription}
              onChange={onPrescriptionChange}
            />
          </section>
        </Reveal>
      )}

      <Reveal>
        <Accordion type="multiple" className="border-t border-border">
          <AccordionItem value="guide">
            <AccordionTrigger className="py-5 text-base hover:text-brand hover:no-underline">
              Как подобрать
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl pb-6 text-muted-foreground">
              <p>
                Не уверены в размере? Запишитесь на бесплатный подбор в любом из наших салонов.
                Оптики помогут с выбором формы и посадкой.
              </p>
              <a
                href="/podbor-ochkov/"
                className="mt-4 inline-flex items-center gap-2 font-medium text-brand"
              >
                Подробнее о подборе
                <ArrowRight className="h-4 w-4" />
              </a>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delivery">
            <AccordionTrigger className="py-5 text-base hover:text-brand hover:no-underline">
              Доставка и возврат
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-muted-foreground">
              <ul className="space-y-2">
                <li>Доставка по Санкт-Петербургу от 1 дня</li>
                <li>Самовывоз из салонов бесплатно</li>
                <li>Оплата картой, наличными или через СБП</li>
                <li>Возврат и обмен в течение 14 дней</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {brand && (
            <AccordionItem value="brand">
              <AccordionTrigger className="py-5 text-base hover:text-brand hover:no-underline">
                О бренде {brand}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-6 text-muted-foreground">
                {brand} — один из брендов, представленных в ОПТИКА 100%. Подробнее о коллекции и
                наличии моделей уточняйте у консультантов.
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </Reveal>
    </div>
  );
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <h2 className="font-serif text-2xl font-semibold sm:text-[26px]">{title}</h2>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  );
}
