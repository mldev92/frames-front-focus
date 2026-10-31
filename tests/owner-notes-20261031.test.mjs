import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("repair page uses working Yandex maps and route links for either city", async () => {
  const repair = await read("../src/components/pages/RepairPage.tsx");
  assert.match(repair, /<YandexMap/);
  assert.match(repair, /markers=\{\[localSalon\.coordinates\]\}/);
  assert.match(repair, /yandexMapsSearchHref\(localSalon\.routeQuery\)/);
  assert.doesNotMatch(repair, /Вставьте iframe Яндекс\.Карт/);
});

test("homepage static service icons do not animate and both cities use VK and Instagram news", async () => {
  const homepage = await read("../src/routes/index.tsx");
  assert.doesNotMatch(homepage, /o100-service-strip-cell:hover/);
  assert.match(homepage, /NEWS_CHANNELS\.vk\.href/);
  assert.match(homepage, /NEWS_CHANNELS\.instagram\.href/);
  assert.doesNotMatch(homepage, /Читать в Telegram/);
});

test("salon details contain the requested stop and payment methods", async () => {
  const contacts = await read("../src/data/contact.ts");
  const page = await read("../src/routes/contacts.tsx");
  assert.match(contacts, /12 \(ост\. Проспект Шахтеров\)/);
  assert.match(page, /label="Мир"/);
  assert.match(page, /label="ЮKassa"/);
  assert.match(page, /<RubleIcon \/>/);
  assert.doesNotMatch(page, /CurrencyIcon/);
});

test("Stellest contact-lens buttons use the owner-supplied destinations", async () => {
  const content = await read("../src/content/stellest-katalog-s-linzami.html");
  assert.match(content, /href="\/search\/\?q=misight"/);
  assert.match(
    content,
    /href="\/catalog_s\/kontaktnye_linzy_\/dlya_kontrolya_miopii\/seed_1_day_pure_edof_32sht_1\/"/,
  );
});

test("frame gender chips hide zero counts unless the filter is active", async () => {
  const listing = await read("../src/components/CatalogListing.tsx");
  assert.match(listing, /visibleFrameAdultGenders/);
  assert.match(
    listing,
    /\(frameGenderCounts\[gender\.key\] \?\? 0\) > 0 \|\| active\.gender\?\.has\(gender\.key\)/,
  );
});
