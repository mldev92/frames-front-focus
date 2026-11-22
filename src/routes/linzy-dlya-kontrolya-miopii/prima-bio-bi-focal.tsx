import { createFileRoute } from "@tanstack/react-router";
import { MyopiaLensDetail } from "@/components/pages/MyopiaLensPage";
import { getMyopiaDetailModel, myopiaDetailHead } from "@/lib/myopia-lenses";

const model = getMyopiaDetailModel("prima-bio-bi-focal");

export const Route = createFileRoute("/linzy-dlya-kontrolya-miopii/prima-bio-bi-focal")({
  head: () => myopiaDetailHead(model),
  component: () => <MyopiaLensDetail model={model} />,
});
