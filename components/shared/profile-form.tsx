"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils/format";
import type { Profile } from "@/lib/types/database";
import { LocationPicker } from "@/components/shared/location-picker";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: profile.lat,
    lng: profile.lng,
  });
  const supabase = createClient();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${profile.id}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.get("firstName"),
        last_name: form.get("lastName"),
        display_name: `${form.get("firstName")} ${form.get("lastName")}`.trim(),
        phone: form.get("phone"),
        address: form.get("address"),
        city: form.get("city"),
        avatar_url: avatarUrl,
        lat: coords.lat,
        lng: coords.lng,
      })
      .eq("id", profile.id);

    setLoading(false);
    if (!error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {initials(profile.display_name)}
          </div>
        )}
        <label className="btn-secondary cursor-pointer">
          Changer la photo
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Prénom</label>
          <input name="firstName" defaultValue={profile.first_name || ""} className="input" />
        </div>
        <div>
          <label className="label">Nom</label>
          <input name="lastName" defaultValue={profile.last_name || ""} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input value={profile.email || ""} disabled className="input opacity-60" />
      </div>
      <div>
        <label className="label">Téléphone</label>
        <input name="phone" defaultValue={profile.phone || ""} className="input" />
      </div>
      <div>
        <label className="label">Ville</label>
        <input name="city" defaultValue={profile.city || ""} className="input" />
      </div>
      <div>
        <label className="label">Adresse</label>
        <input name="address" defaultValue={profile.address || ""} className="input" />
      </div>
      <div>
        <label className="label">Localisation</label>
        <LocationPicker
          lat={coords.lat}
          lng={coords.lng}
          onChange={(lat, lng) => setCoords({ lat, lng })}
        />
      </div>

      {saved && <p className="text-sm text-accent">Profil mis à jour.</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
