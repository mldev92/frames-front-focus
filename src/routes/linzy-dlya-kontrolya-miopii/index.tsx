import { createFileRoute } from "@tanstack/react-router";
import { MyopiaLensLanding } from "@/components/pages/MyopiaLensPage";
import { MYOPIA_PATH, MYOPIA_TITLE, myopiaPageHead } from "@/data/myopia-lenses";

export const Route = createFileRoute("/linzy-dlya-kontrolya-miopii/")({
  head: () =>
    myopiaPageHead(
      MYOPIA_TITLE,
      "Очковые и контактные линзы для контроля миопии у детей. Сравнение дизайнов, каталог и запись к детскому врачу в Санкт-Петербурге.",
      MYOPIA_PATH,
    ),
  component: MyopiaLensLanding,
});
