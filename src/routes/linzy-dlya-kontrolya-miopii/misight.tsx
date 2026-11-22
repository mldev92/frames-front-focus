import { createFileRoute } from "@tanstack/react-router";
import { MyopiaLensDetail } from "@/components/pages/MyopiaLensPage";
import { getMyopiaDetailModel, myopiaDetailHead } from "@/lib/myopia-lenses";

const model = getMyopiaDetailModel("misight");

export const Route = createFileRoute("/linzy-dlya-kontrolya-miopii/misight")({
  head: () => myopiaDetailHead(model),
  component: () => <MyopiaLensDetail model={model} />,
});
