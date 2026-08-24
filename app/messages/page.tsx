import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getConversationsForUser } from "@/lib/data/messages";
import { timeAgo, initials } from "@/lib/utils/format";
import { Navbar } from "@/components/layout/navbar";

export const metadata = { title: "Messagerie" };

export default async function MessagesInboxPage() {
  const me = await requireUser();
  const conversations = await getConversationsForUser(me.id, me.role);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">Messagerie</h1>
        {conversations.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">Aucune conversation pour le moment.</p>
        ) : (
          <div className="mt-6 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {conversations.map((c) => {
              const conv = c as unknown as {
                id: string;
                client: { profile: { display_name: string | null; avatar_url: string | null } };
                artisan: { profile: { display_name: string | null; company_name: string | null; avatar_url: string | null } };
                messages: { body: string | null; created_at: string }[];
              };
              const other = me.role === "artisan" ? conv.client.profile : conv.artisan.profile;
              const otherName =
                (other as { company_name?: string }).company_name || other.display_name || "Utilisateur";
              const lastMessage = conv.messages?.[conv.messages.length - 1];
              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {initials(otherName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{otherName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {lastMessage?.body || "Nouvelle conversation"}
                    </p>
                  </div>
                  {lastMessage && (
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(lastMessage.created_at)}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
