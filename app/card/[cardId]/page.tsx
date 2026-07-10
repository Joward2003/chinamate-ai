import { notFound } from "next/navigation";
import { HelpCardView } from "@/components/help-card-view";
import { LocalHelpShell } from "@/components/local-help-shell";
import { getHelpCard } from "@/data/helpCards";

export default async function CardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const card = getHelpCard(cardId);
  if (!card) notFound();

  return (
    <LocalHelpShell>
      <HelpCardView card={card} />
    </LocalHelpShell>
  );
}
