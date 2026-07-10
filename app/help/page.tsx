import { HelpModeWorkspace } from "@/components/help-mode-workspace";
import { LocalHelpShell } from "@/components/local-help-shell";
import { pickerContent } from "@/data/helpCards";

export default function HelpPage() {
  return (
    <LocalHelpShell>
      <div className="page-shell py-7 md:py-12">
        <HelpModeWorkspace
          mode="problem"
          content={pickerContent.problem}
          contentByMode={pickerContent}
        />
      </div>
    </LocalHelpShell>
  );
}
