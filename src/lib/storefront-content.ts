import { useQuery } from "@tanstack/react-query";
import type { CityCode } from "@/lib/store/city";
import defaults from "../../public/storefront-content-defaults.json";

export function siteContentEditor(block: keyof typeof defaults) {
  return `/bitrix/admin/o100_site_content.php?lang=ru&block=${block}`;
}

export function useStorefrontContent() {
  const { data } = useQuery<Partial<typeof defaults>>({
    queryKey: ["storefront-content"],
    enabled: !import.meta.env.SSR,
    staleTime: 60_000,
    refetchOnWindowFocus: "always",
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/store/site_content.php", { credentials: "omit", signal });
      if (!response.ok) throw new Error("Storefront content is unavailable");
      return response.json();
    },
  });
  return { ...defaults, ...data };
}

export function storefrontContact(city: CityCode, content: Pick<typeof defaults, "phone" | "contact_spb" | "contact_nvk">) {
  const { number } = content.phone;
  const { email, telegram, max } = content[`contact_${city}`];
  return {
    phone: { label: number, href: `tel:${number.replace(/[^+\d]/g, "")}` },
    email: { label: email, href: `mailto:${email}` },
    telegram: { label: `@${telegram}`, href: `tg://resolve?domain=${telegram}` },
    max: { label: "MAX", href: max },
  };
}

export function useStorefrontContact(city: CityCode) {
  return storefrontContact(city, useStorefrontContent());
}
