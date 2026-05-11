## ОПТИКА 100% — modern frontend plan

A Warby Parker–style modernization of optika100.com: clean editorial layout, large imagery, restrained palette, fast filters. Russian-language UI, full catalog + clinic services, static mock data so your backend team can wire it up later.

### Brand
- **Name:** ОПТИКА 100% (logo lockup: red "100%" mark + "ОПТИКА" wordmark, kept from the original)
- **Language:** Russian (ru) across all pages and metadata
- **Palette:** off-white background, deep ink text, signature red accent (kept from current brand, toned down for Warby-like calm), warm neutral surfaces
- **Type:** modern serif for headings (e.g. Fraunces / PT Serif), clean sans for body (Inter / Manrope)
- **Tone:** editorial, trustworthy, medical-grade clean — not the current "promo-banner" feel

### Routes (≈18 pages)

```text
/                              Главная — герой, плитки категорий, бестселлеры, услуги клиники, журнал
/opravy                        Оправы — каталог + фильтры
/solntsezashchitnye            Солнцезащитные очки — каталог + фильтры
/kontaktnye-linzy              Контактные линзы — каталог + фильтры
/linzy-dlya-ochkov             Линзы для очков — каталог + фильтры
/aksessuary                    Аксессуары — футляры, салфетки, цепочки
/products/$slug                Карточка товара (галерея, варианты, характеристики, в корзину)
/uslugi                        Услуги клиники (хаб)
/uslugi/priem-vracha           Онлайн-запись к врачу
/uslugi/diagnostika            Диагностика зрения
/uslugi/podbor-ochkov          Подбор очков
/uslugi/remont                 Ремонт очков
/salony                        Салоны (список + карта-плейсхолдер, адрес на Кирочной)
/korzina                       Корзина
/checkout                      Оформление заказа (UI-форма)
/cabinet                       Личный кабинет (заказы, рецепты, адреса)
/o-nas                         О компании
/zhurnal                       Журнал — список статей
/zhurnal/$slug                 Статья
*                              404 (уже в __root)
```

### Общий лэйаут

- **Шапка:** announcement bar (акции), логотип, основная навигация (Оправы, Солнцезащитные, Контактные линзы, Линзы для очков, Аксессуары, Услуги, Салоны), иконки (поиск, кабинет, отложенные, корзина с бейджем), мега-меню на десктопе, drawer на мобиле.
- **Подвал:** колонки (Каталог, Услуги, Компания, Помощь), форма подписки, соцсети, контакт-блок (адрес, e-mail), правовая строка.
- **Cart drawer:** глобальный slide-over из шапки.

### Фильтры каталога

Сайдбар на десктопе, bottom-sheet на мобиле. Набор зависит от категории:

**Оправы / Солнцезащитные:**
- Форма (прямоугольные, круглые, авиаторы, кошачий глаз, геометрические, панто)
- Материал (ацетат, металл, титан, комбинированные)
- Цвет
- Пол (мужские, женские, детские, унисекс)
- Размер (узкие/средние/широкие)
- Бренд
- Цена
- Тип линз (для солнцезащитных): поляризация, UV, зеркальные

**Контактные линзы:**
- Бренд (Acuvue, CooperVision, Bausch+Lomb…)
- Режим ношения (однодневные, двухнедельные, месячные)
- Тип (сферические, торические, мультифокальные, цветные)
- Материал (гидрогель, силикон-гидрогель)
- Параметры рецепта: SPH, CYL, AX, BC, DIA (селекторы)
- Цена

**Линзы для очков:**
- Производитель
- Индекс преломления
- Покрытия (антибликовое, синий блок, фотохромные)
- Назначение (для дали, для близи, прогрессивные, офисные, детские)

Активные фильтры — чипы сверху, счётчик результатов, сортировка (популярные, новинки, цена ↑/↓).

### Шаблон карточки товара (PDP)

- Галерея (главное фото + миниатюры, зум)
- Цена, бейджи ("Новинка", "Хит"), бренд
- Свотчи цвета / варианты
- Селектор размера
- Для линз — поля рецепта (SPH, CYL, BC, DIA, кол-во упаковок)
- CTA: "В корзину" + "Отложить"
- Табы: Характеристики, Как подобрать, Доставка и оплата, Отзывы
- Блок "С этим покупают", "Недавно смотрели"

### Услуги клиники

Единый шаблон страницы услуги: hero с фото, краткое описание, цена/длительность, "что входит", шаги, врачи, FAQ, CTA "Записаться" → форма с датой/временем (UI-only).

### Переиспользуемые компоненты

ProductCard, LensCard, ColorSwatchRow, PriceTag, BadgeRow, FilterGroup, RangeSlider, PrescriptionFields, Accordion, Breadcrumbs, SectionHeading, EditorialBlock, CategoryTile, Gallery, QuantityStepper, CheckoutStepper, AnnouncementBar, NewsletterForm, SalonCard, ServiceCard, ArticleCard, Tabs, EmptyState, BookingForm.

### Слой данных

`src/data/` — типизированные моки:
- `frames.ts` — оправы (~16 моделей)
- `sunglasses.ts` — солнцезащитные (~12)
- `contactLenses.ts` — контактные линзы (~10 SKU, разные бренды)
- `ophthalmicLenses.ts` — линзы для очков (~8)
- `accessories.ts` — футляры, салфетки, цепочки (~10)
- `services.ts` — 4 услуги клиники
- `salons.ts` — салоны (минимум адрес на Кирочной, 17)
- `articles.ts` — журнал (6 статей)
- `faq.ts`, `filters.ts`, `brands.ts`

`src/lib/store/` — Zustand store для корзины и отложенных, с persist в localStorage. Переход на ваш бэкенд = замена модулей в `src/data/` на fetch'еры.

### Дизайн-система

Токены в `src/styles.css` (oklch):
- background, foreground, muted, border
- primary (ink), accent (приглушённый бренд-красный), success
- Шрифты подключаются в `__root` через Google Fonts
- Крупные сетки с воздухом, image-led композиции, минимум анимаций

Все компоненты — только через токены, без хардкод-цветов.

### Изображения

Генерируются под плейсхолдеры:
- Hero-кадр (модель в очках, светлый фон)
- ~50 продуктовых кадров (оправы/солнцезащитные/упаковки линз/аксессуары)
- Плитки категорий (5–6)
- Фото для услуг клиники (4)
- Обложки статей журнала
- Фото салона

Сохраняются в `src/assets/`, импортируются как ES-модули.

### SEO

В каждом `head()` — уникальные title, description, og:title, og:description (русский). PDP и статьи журнала берут og:image из своего hero. Главная и категории — отдельные мета.

### Что НЕ входит (frontend-only)

- Реальная авторизация, оплата, склад — формы работают как UI-оболочки с toast-фидбеком
- Реальная карта на /salony — статичная картинка + список
- Реальная запись врача — форма без отправки
- Виртуальная примерка — секция-плейсхолдер

### Порядок сборки

1. Токены, шрифты, общий Header/Footer/CartDrawer, типы и моки данных
2. Главная + плитки категорий
3. Каталог "Оправы" с фильтрами + ProductCard
4. PDP + галерея + Zustand-корзина
5. Солнцезащитные, Контактные линзы (с полями рецепта), Линзы, Аксессуары
6. Корзина, Checkout, Личный кабинет
7. Услуги клиники (хаб + 4 страницы) + форма записи
8. Салоны, О нас, Журнал (список + статья)
9. Генерация изображений, SEO-проход, мобильная QA

### Технические заметки

- Стек: TanStack Start + React 19 + Tailwind v4 + shadcn/ui (уже стоит)
- По одному файлу на маршрут в `src/routes/` (плоские точки для вложенности: `uslugi.priem-vracha.tsx`, `zhurnal.$slug.tsx`)
- Корзина и отложенные — Zustand + persist
- Все "API" вызовы идут через `src/data/*` — переезд на ваш бэкенд = замена этих модулей на реальные fetch'еры, UI трогать не нужно
- Lang: `<html lang="ru">` в `__root`
