import { LocalHelpShell } from "@/components/local-help-shell";
import { ProfilePreferenceCenter } from "@/components/profile-preference-center";

export default function ProfilePage() {
  return (
    <LocalHelpShell>
      <div className="page-shell py-8 md:py-12">
        <ProfilePreferenceCenter />
      </div>
    </LocalHelpShell>
  );
}
