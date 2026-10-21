import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("regional routing preserves the explicit SPb lens landing", async () => {
  const source = await read("../src/lib/city-routing.ts");
  const store = await read("../src/lib/store/city.ts");
  const root = await read("../src/routes/__root.tsx");
  const lenses = await read("../src/routes/linzy-spb.tsx");
  const expectedMappings = [
    '["/optika-spb/", "/contacts/"]',
    '["/tsvetnye-linzy-s-dioptriyami/", "/catalog_n/kontaktnye_linzy/tsvetnye/"]',
    '["/biometriya-glaza/", "/kabinet-diagnostiki-nk/"]',
  ];

  for (const mapping of expectedMappings) assert.ok(source.includes(mapping));
  assert.doesNotMatch(source, /\["\/linzy-spb\/?", "\/catalog_n\/kontaktnye_linzy_\/"\]/);
  assert.doesNotMatch(root, /"\/linzy-spb\/":"\/catalog_n\/kontaktnye_linzy_\/"/);
  assert.match(lenses, /if \(cityHydrated && city !== "spb"\) setCity\("spb"\)/);
  assert.match(source, /city === "nvk"/);
  assert.match(source, /NVK_ROUTE_FALLBACKS\.get\(href\)/);
  assert.match(store, /skipHydration: true/);
  assert.match(root, /useCityStore\.persist\.rehydrate\(\)/);
  assert.match(root, /REGIONAL_REDIRECT_BOOTSTRAP/);
  assert.match(root, /localStorage\.getItem\(\"o100-city-v2\"\)/);
  assert.match(root, /if\(target\)location\.replace/);
});

test("shared navigation suppresses SPb-only links and contacts for Novokuznetsk", async () => {
  const footer = await read("../src/components/layout/Footer.tsx");
  const header = await read("../src/components/layout/Header.tsx");
  const megaMenu = await read("../src/components/layout/HeaderMegaMenu.tsx");

  for (const href of ["/linzy-spb/", "/biometriya-glaza/", "/optika-spb/"]) {
    assert.ok(footer.includes(href));
  }
  assert.match(footer, /city === "spb"\s*\|\|\s*!\[/);
  assert.match(footer, /city === "spb" \?/);
  assert.match(header, /cityCode === "nvk" \? NK_SALONS\[0\] : PRIMARY_SALON/);
  assert.match(header, /if \(!mounted \|\| !cityHydrated\) return/);
  assert.match(header, /setTimeout\(\(\) => window\.location\.assign\(nextHref\), 0\)/);
  assert.match(header, /item\.label !== "Линзы для очков"/);
  assert.match(header, /cityCode !== "nvk" && \(/);
  assert.match(header, /NVK_PROMOS = \[\{ text: "АКЦИИ В САЛОНАХ НОВОКУЗНЕЦКА", href: "\/#promotions" \}\]/);
  assert.match(header, /href=\{regionalHref\("\/#promotions"\)\}/);
  assert.match(megaMenu, /Контактные линзы в Новокузнецке/);
  assert.match(megaMenu, /Доставка и самовывоз/);
});

test("Novokuznetsk uses its verified contacts and disables unavailable actions", async () => {
  const contacts = await read("../src/data/contact.ts");
  const messenger = await read("../src/components/MessengerFAB.tsx");
  const checkout = await read("../src/routes/checkout.tsx");
  const homepage = await read("../src/routes/index.tsx");
  const installment = await read("../src/routes/tinkoff.tsx");

  assert.match(contacts, /label: "sale@optika100\.com"/);
  assert.match(contacts, /domain=optica_100/);
  assert.match(contacts, /f9LHodD0cOI9mxgb1lKx2s5xbbX2Psd4fGNop-GbIAElZQq-ARajInTU6GA/);
  assert.match(messenger, /if \(city === "nvk"\) return/);
  assert.match(messenger, /city !== "nvk" && \(/);
  assert.match(checkout, /option\.code !== "t_installment" \|\| city !== "Новокузнецк"/);
  assert.match(homepage, /city !== "nvk" && \(/);
  assert.match(installment, /if \(city === "nvk"\) return <Navigate to="\/" replace \/>/);
});

test("region selector restores All Russia while retaining the SPb catalog contract", async () => {
  const store = await read("../src/lib/store/city.ts");
  const header = await read("../src/components/layout/Header.tsx");

  assert.match(store, /export type RegionCode = CityCode \| "all"/);
  assert.match(store, /all: "Вся Россия"/);
  assert.match(store, /region === "nvk" \? "nvk" : "spb"/);
  assert.match(header, /\{ code: "all", label: "Вся Россия" \}/);
  assert.match(header, /АКЦИИ В САЛОНАХ НОВОКУЗНЕЦКА/);
});

test("shared pages derive regional text and links from the selected city", async () => {
  const homepage = await read("../src/routes/index.tsx");
  const repair = await read("../src/components/pages/RepairPage.tsx");
  const productInfo = await read("../src/components/ProductInfoSections.tsx");
  const appointment = await read("../src/components/AppointmentModal.tsx");
  const checkout = await read("../src/routes/checkout.tsx");

  assert.match(homepage, /Салоны в Новокузнецке/);
  assert.match(homepage, /catalogHref\("opravy", city\)/);
  assert.match(homepage, /\.o100-bts-content\{/);
  assert.match(homepage, /\.o100-bts-actions\{/);
  assert.match(homepage, /\.o100-bts-quiz\{/);
  assert.match(repair, /city === "nvk" \? NK_SALONS\[0\] : SPB_SALONS\[0\]/);
  assert.match(productInfo, /serviceHref\("diagnostika", city\)/);
  assert.match(productInfo, /Доставка по Новокузнецку/);
  assert.match(appointment, /salon\.city === "nk"/);
  assert.match(appointment, /availableSalons\.map/);
  assert.match(appointment, /if \(!open \|\| \(step !== 1 && step !== 2\)\) \{/);
  assert.match(appointment, /slotsRefreshSequence/);
  assert.match(appointment, /window\.addEventListener\("focus", refreshVisibleSlots\)/);
  assert.match(
    appointment,
    /document\.addEventListener\("visibilitychange", refreshVisibleSlots\)/,
  );
  assert.match(appointment, /window\.setInterval\(refreshVisibleSlots, 60_000\)/);
  assert.match(appointment, /const mostAvailableGroup = groupedSlots\.reduce/);
  assert.match(appointment, /: mostAvailableGroup\.dateKey/);
  assert.match(appointment, /h-\[calc\(100dvh-32px\)\].*w-full min-w-0/);
  assert.match(appointment, /parseAppointmentLocalDate/);
  assert.match(appointment, /Показываем только дни, где есть свободное время/);
  assert.match(checkout, /regionalCity === "nvk" \? "Новокузнецк" : "Санкт-Петербург"/);
});

test("Novokuznetsk search filters SPb-only pages and regionalizes result links", async () => {
  const index = await read("../src/data/site-search.ts");
  const route = await read("../src/routes/search.tsx");

  assert.match(index, /region\?: "spb"/);
  assert.match(route, /city === "spb" \|\| page\.region !== "spb"/);
  assert.match(route, /regionalSiteHref\(page\.href, city\)/);
  assert.match(route, /product=\{p\} city=\{city\}/);
});

test("shared route metadata stays city-neutral", async () => {
  for (const path of [
    "../src/routes/index.tsx",
    "../src/routes/main-v2.tsx",
    "../src/routes/remont-ochkov.tsx",
    "../src/routes/uslugi.tsx",
  ]) {
    const source = await read(path);
    const headBlock = source.slice(source.indexOf("head:"), source.indexOf("component:"));
    assert.doesNotMatch(headBlock, /Санкт-Петербург|Петербург|СПб/);
  }
});

test("catalog banners regionalize their catalog and service links", async () => {
  const source = await read("../src/components/CatalogBanner.tsx");

  assert.match(source, /regionalSiteHref\(banner\.href, city\)/);
});

test("frame-lens menu links installation into an existing frame to services", async () => {
  const source = await read("../src/components/layout/HeaderMegaMenu.tsx");

  assert.match(source, /label: "Установка линз в свою оправу",\s+href: "\/#services"/);
});

test("frame-lens production-time utility has no destination", async () => {
  const source = await read("../src/components/layout/HeaderMegaMenu.tsx");

  assert.match(source, /label: "Срок изготовления от 1 часа",\s+icon:/);
});

test("contact-lens menu hides subscription promo and links its guide to the lens landing", async () => {
  const source = await read("../src/components/layout/HeaderMegaMenu.tsx");

  assert.doesNotMatch(source, /Подписка на линзы −15%/);
  assert.match(source, /label: "Гид по подбору", href: "\/linzy-spb"/);
});

test("about page uses current company figures and footer exposes one about link", async () => {
  const about = await read("../src/routes/o-nas.tsx");
  const footer = await read("../src/components/layout/Footer.tsx");

  assert.doesNotMatch(about, /2005|50 000\+/);
  assert.match(about, /с 2006 года/);
  assert.match(about, /90 000\+/);
  assert.match(about, /5 салонов/);
  assert.match(about, /1 в СПБ и 4 в Новокузнецке/);
  assert.doesNotMatch(footer, /Почему мы\?|\/o-nas\/#pochemu-my/);
});
