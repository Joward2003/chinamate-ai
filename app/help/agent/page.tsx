import { AgentHelpWorkflow } from "@/components/agent-help-workflow";
import { LocalHelpShell } from "@/components/local-help-shell";

export default async function AgentHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ question?: string }>;
}) {
  const { question } = await searchParams;
  return (
    <LocalHelpShell>
      <div className="page-shell py-6 md:py-10">
        <AgentHelpWorkflow initialQuestion={question?.slice(0, 1200) ?? ""} />
      </div>
    </LocalHelpShell>
  );
}
