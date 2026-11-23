import { createFileRoute } from "@tanstack/react-router";
import { MyopiaLensLanding } from "@/components/pages/MyopiaLensPage";
import { MYOPIA_PATH, myopiaPageHead } from "@/lib/myopia-lenses";

export const Route = createFileRoute("/linzy-dlya-kontrolya-miopii/")({
  head: () =>
    myopiaPageHead(
      "Линзы для контроля миопии у детей в СПб",
      "Сравнение очковых и контактных линз для контроля миопии у детей, цены и подбор. Приём детского врача и биометрия Lenstar LS 900 на Кирочной, 17.",
      MYOPIA_PATH,
    ),
  component: MyopiaLensLanding,
});
