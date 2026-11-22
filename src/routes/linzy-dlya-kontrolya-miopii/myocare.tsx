import { createFileRoute } from "@tanstack/react-router";
import { MyopiaLensDetail } from "@/components/pages/MyopiaLensPage";
import { getMyopiaDetailModel, myopiaDetailHead } from "@/data/myopia-lenses";

const model = getMyopiaDetailModel("myocare");

export const Route = createFileRoute("/linzy-dlya-kontrolya-miopii/myocare")({
  head: () => myopiaDetailHead(model),
  component: () => <MyopiaLensDetail model={model} />,
});
