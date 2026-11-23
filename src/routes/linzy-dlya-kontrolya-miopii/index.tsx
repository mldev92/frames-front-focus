import { createFileRoute } from "@tanstack/react-router";
import { MyopiaLensLanding } from "@/components/pages/MyopiaLensPage";
import { MYOPIA_PATH, myopiaPageHead } from "@/lib/myopia-lenses";

export const Route = createFileRoute("/linzy-dlya-kontrolya-miopii/")({
  head: () =>
    myopiaPageHead(
      "Очковые и контактные линзы для контроля миопии",
      "Очковые и контактные линзы для контроля миопии у детей. Сравнение дизайнов, каталог и запись к детскому врачу в Санкт-Петербурге.",
      MYOPIA_PATH,
    ),
  component: MyopiaLensLanding,
});
