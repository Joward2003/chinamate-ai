import { FocusedHome } from "@/components/focused-home";
import { LocalHelpShell } from "@/components/local-help-shell";

export default function Page() {
  return (
    <LocalHelpShell>
      <FocusedHome />
    </LocalHelpShell>
  );
}
