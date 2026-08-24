import { requireUser } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentsUploader } from "./documents-uploader";

export const metadata = { title: "Vérification" };

export default async function ArtisanDocumentsPage() {
  const me = await requireUser("artisan");
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("artisan_id", me.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Vérification du profil</h1>
      <p className="mt-1 text-muted-foreground">
        Envoyez vos pièces justificatives (CNI, registre de commerce, diplôme...) pour obtenir le
        badge « Artisan vérifié ».
      </p>
      <DocumentsUploader artisanId={me.id} documents={docs || []} />
    </div>
  );
}
