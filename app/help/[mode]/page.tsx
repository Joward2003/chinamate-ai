import { notFound } from "next/navigation";
import { LocalHelpShell } from "@/components/local-help-shell";
import { HelpModeWorkspace } from "@/components/help-mode-workspace";
import { pickerContent, type HelpMode } from "@/data/helpCards";

export default async function HelpModePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode: rawMode } = await params;
  if (!(rawMode in pickerContent)) notFound();
  const mode = rawMode as HelpMode;
  const content = pickerContent[mode];

  return (
    <LocalHelpShell>
      <div className="page-shell py-6 md:py-10">
        <HelpModeWorkspace mode={mode} content={content} />
      </div>
    </LocalHelpShell>
  );
}
