import { notFound } from "next/navigation";
import { ChineseShowCard } from "@/components/chinese-show-card";
import { LocalHelpShell } from "@/components/local-help-shell";
import { getPhraseCard } from "@/data/helpCards";

export default async function PhrasePage({
  params,
}: {
  params: Promise<{ phraseId: string }>;
}) {
  const { phraseId } = await params;
  const phrase = getPhraseCard(phraseId);
  if (!phrase) notFound();

  return (
    <LocalHelpShell>
      <ChineseShowCard phrase={phrase} />
    </LocalHelpShell>
  );
}
