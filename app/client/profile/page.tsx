import { requireUser } from "@/lib/data/auth";
import { ProfileForm } from "@/components/shared/profile-form";

export const metadata = { title: "Mon profil" };

export default async function ClientProfilePage() {
  const me = await requireUser("client");
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <ProfileForm profile={me} />
    </div>
  );
}
