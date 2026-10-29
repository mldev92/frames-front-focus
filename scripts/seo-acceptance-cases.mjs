// Реальные примеры аудита: разные глубины URL, города и товар вне наличия.
export const seoAcceptanceCases = [
  { path: "/catalog_s/opravy/muzhskie/", h1: "Мужские оправы" },
  { path: "/catalog_s/opravy/zhenskie/", h1: "Женские оправы" },
  { path: "/catalog_s/opravy/detskie_1/", h1: "Детские оправы" },
  { path: "/catalog_s/opravy/detskie_1/dlya_malchikov/", h1: "Оправы для мальчиков" },
  { path: "/catalog_s/linzy_dlya_ochkov/detskie/", h1: "Детские линзы для очков" },
  { path: "/catalog_s/linzy_dlya_ochkov/bifokalnye/", h1: "Бифокальные линзы для очков" },
  { path: "/catalog_n/opravy/", h1: "Оправы", description: "Новокузнецке" },
  { path: "/catalog_n/kontaktnye_linzy/1_day_acuvue_moist_30_sht/", h1: "1-Day Acuvue Moist (30 шт.)" },
  { path: "/catalog_s/linzy_dlya_ochkov/miyosmart/", h1: "MiYOSMART", description: "миопии" },
  { path: "/catalog_s/linzy_dlya_ochkov/detskie/as_stellest_2_0_crizal_prevencia/", h1: "AS Stellest 2.0 Crizal Prevencia", description: "Stellest" },
  { path: "/catalog_s/opravy/muzhskie/oprava_nomad_40220n_tb07/", h1: "Оправа: NOMAD 40220N-TB07" },
];
